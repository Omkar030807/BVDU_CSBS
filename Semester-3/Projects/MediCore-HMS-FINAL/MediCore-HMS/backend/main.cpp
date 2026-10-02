#include "services/HospitalService.h"
#include "models/User.h"
#include "utils/Http.h"
#include "utils/Logger.h"
#include <iostream>
#include <fstream>
#include <filesystem>
#include <thread>
#include <memory>
#include <cstring>
#include <ctime>

#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#pragma comment(lib,"ws2_32.lib")
using Socket = SOCKET;
constexpr Socket INVALID_SOCKET_VALUE = INVALID_SOCKET;
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
using Socket = int;
constexpr Socket INVALID_SOCKET_VALUE = -1;
#endif

static void closeSocket(Socket s){
#ifdef _WIN32
    closesocket(s);
#else
    close(s);
#endif
}

static std::string mimeType(const std::string& path){
    if(path.size()>=5 && path.compare(path.size()-5,5,".html")==0)return "text/html; charset=utf-8";
    if(path.size()>=4 && path.compare(path.size()-4,4,".css")==0)return "text/css; charset=utf-8";
    if(path.size()>=3 && path.compare(path.size()-3,3,".js")==0)return "application/javascript; charset=utf-8";
    if(path.size()>=4 && path.compare(path.size()-4,4,".svg")==0)return "image/svg+xml";
    return "text/plain; charset=utf-8";
}

static HttpRequest parseRequest(const std::string& raw){
    HttpRequest req;
    const auto headEnd=raw.find("\r\n\r\n");
    const std::string head=raw.substr(0,headEnd);
    std::istringstream hs(head); std::string line;
    if(std::getline(hs,line)){
        std::istringstream first(line); first>>req.method>>req.path;
        const auto q=req.path.find('?'); if(q!=std::string::npos)req.path=req.path.substr(0,q);
    }
    while(std::getline(hs,line)){
        if(!line.empty()&&line.back()=='\r')line.pop_back();
        const auto p=line.find(':'); if(p!=std::string::npos)req.headers[line.substr(0,p)]=line.substr(p+1);
    }
    if(headEnd!=std::string::npos) req.body=raw.substr(headEnd+4);
    return req;
}

struct HttpException : std::runtime_error {
    int status;
    HttpException(int s, const std::string& message) : std::runtime_error(message), status(s) {}
};

static void sendResponse(Socket client,const HttpResponse& r){
    std::ostringstream out;
    out<<"HTTP/1.1 "<<r.status<<' '<<statusText(r.status)<<"\r\n"
       <<"Content-Type: "<<r.contentType<<"\r\n"
       <<"Content-Length: "<<r.body.size()<<"\r\n"
       <<"Connection: close\r\n"
       <<"Cache-Control: no-store\r\n\r\n"<<r.body;
    const auto data=out.str();
#ifdef _WIN32
    send(client,data.c_str(),static_cast<int>(data.size()),0);
#else
    ::send(client,data.c_str(),data.size(),0);
#endif
}

static std::string patientJson(const Patient&p){return "{\"id\":"+std::to_string(p.id())+",\"name\":\""+jsonEscape(p.name())+"\",\"age\":"+std::to_string(p.age())+",\"gender\":\""+jsonEscape(p.gender())+"\",\"phone\":\""+jsonEscape(p.phone())+"\",\"bloodGroup\":\""+jsonEscape(p.bloodGroup())+"\",\"diagnosis\":\""+jsonEscape(p.diagnosis())+"\",\"createdAt\":\""+jsonEscape(p.createdAt())+"\"}";}
static std::string doctorJson(const Doctor&d){return "{\"id\":"+std::to_string(d.id())+",\"name\":\""+jsonEscape(d.name())+"\",\"specialty\":\""+jsonEscape(d.specialty())+"\",\"phone\":\""+jsonEscape(d.phone())+"\",\"room\":\""+jsonEscape(d.room())+"\",\"available\":"+(d.available()?"true":"false")+"}";}
static std::string appointmentJson(const Appointment&a){return "{\"id\":"+std::to_string(a.id())+",\"patientId\":"+std::to_string(a.patientId())+",\"doctorId\":"+std::to_string(a.doctorId())+",\"date\":\""+jsonEscape(a.date())+"\",\"time\":\""+jsonEscape(a.time())+"\",\"status\":\""+toString(a.status())+"\"}";}
static std::string recordJson(const MedicalRecord&r){return "{\"id\":"+std::to_string(r.id())+",\"patientId\":"+std::to_string(r.patientId())+",\"doctorId\":"+std::to_string(r.doctorId())+",\"date\":\""+jsonEscape(r.date())+"\",\"diagnosis\":\""+jsonEscape(r.diagnosis())+"\",\"treatment\":\""+jsonEscape(r.treatment())+"\",\"notes\":\""+jsonEscape(r.notes())+"\"}";}
static std::string prescriptionJson(const Prescription&p){return "{\"id\":"+std::to_string(p.id())+",\"patientId\":"+std::to_string(p.patientId())+",\"doctorId\":"+std::to_string(p.doctorId())+",\"medicine\":\""+jsonEscape(p.medicine())+"\",\"dosage\":\""+jsonEscape(p.dosage())+"\",\"duration\":\""+jsonEscape(p.duration())+"\",\"date\":\""+jsonEscape(p.date())+"\",\"dispensed\":"+(p.dispensed()?"true":"false")+"}";}
static std::string medicineJson(const Medicine&m){std::ostringstream o;o<<"{\"id\":"<<m.id()<<",\"name\":\""<<jsonEscape(m.name())<<"\",\"category\":\""<<jsonEscape(m.category())<<"\",\"stock\":"<<m.stock()<<",\"price\":"<<m.price()<<",\"reorderLevel\":"<<m.reorderLevel()<<"}";return o.str();}
static std::string bedJson(const Bed&b){return "{\"id\":"+std::to_string(b.id())+",\"ward\":\""+jsonEscape(b.ward())+"\",\"number\":\""+jsonEscape(b.number())+"\",\"status\":\""+bedStatusName(b.status())+"\",\"patientId\":"+std::to_string(b.patientId())+"}";}
static std::string invoiceJson(const Invoice&i){std::ostringstream o;o<<"{\"id\":"<<i.id()<<",\"patientId\":"<<i.patientId()<<",\"amount\":"<<i.amount()<<",\"description\":\""<<jsonEscape(i.description())<<"\",\"paid\":"<<(i.paid()?"true":"false")<<"}";return o.str();}

template<typename T, typename F> static std::string jsonArray(const std::vector<T>& v,F formatter){std::string out="[";for(size_t i=0;i<v.size();++i){if(i)out+=",";out+=formatter(v[i]);}return out+"]";}

class Server {
    int port_;
    std::unique_ptr<HospitalService> service_;
    Logger logger_;
    std::string webRoot_;
public:
    Server(int port,std::string dataDir,std::string webRoot)
        :port_(port),service_(std::make_unique<HospitalService>(std::move(dataDir))),logger_("medicore.log"),webRoot_(std::move(webRoot)){}

    void run(){
#ifdef _WIN32
        WSADATA wsa{}; WSAStartup(MAKEWORD(2,2),&wsa);
#endif
        Socket server=::socket(AF_INET,SOCK_STREAM,0);
        if(server==INVALID_SOCKET_VALUE)throw std::runtime_error("Could not create socket");
        int opt=1; setsockopt(server,SOL_SOCKET,SO_REUSEADDR,reinterpret_cast<const char*>(&opt),sizeof(opt));
        sockaddr_in addr{};addr.sin_family=AF_INET;addr.sin_addr.s_addr=INADDR_ANY;addr.sin_port=htons(static_cast<unsigned short>(port_));
        if(::bind(server,reinterpret_cast<sockaddr*>(&addr),sizeof(addr))<0)throw std::runtime_error("Could not bind port");
        if(::listen(server,32)<0)throw std::runtime_error("Could not listen");
        logger_.info("MediCore HMS running at http://localhost:"+std::to_string(port_));
        while(true){Socket client=::accept(server,nullptr,nullptr);if(client==INVALID_SOCKET_VALUE)continue;std::thread(&Server::handle,this,client).detach();}
    }
private:
    void handle(Socket client){
        char buffer[16384]{};int received=0;
#ifdef _WIN32
        received=recv(client,buffer,sizeof(buffer)-1,0);
#else
        received=static_cast<int>(recv(client,buffer,sizeof(buffer)-1,0));
#endif
        if(received<=0){closeSocket(client);return;}
        if(received >= static_cast<int>(sizeof(buffer)-1)){ sendResponse(client,{413,"application/json","{\"error\":\"Request too large\"}"}); closeSocket(client); return; }
        HttpRequest req=parseRequest(std::string(buffer,received));
        HttpResponse response;
        try{response=route(req);}
        catch(const HttpException&e){response={e.status,"application/json","{\"error\":\""+jsonEscape(e.what())+"\"}"};}
        catch(const std::invalid_argument&e){ const std::string msg=e.what(); const int status=(msg=="Doctor already has an appointment at this time" || msg=="Bed is not available")?409:400; response={status,"application/json","{\"error\":\""+jsonEscape(msg)+"\"}"};}
        catch(const std::out_of_range&e){response={400,"application/json","{\"error\":\"Invalid numeric value\"}"};}
        catch(const std::exception&e){logger_.error(e.what());response={500,"application/json","{\"error\":\"Internal server error\"}"};}
        sendResponse(client,response);closeSocket(client);
    }

    HttpResponse route(const HttpRequest& req){
        if(req.path=="/api/health")return {200,"application/json","{\"status\":\"ok\",\"service\":\"MediCore HMS\"}"};
        if(req.path=="/api/login"&&req.method=="POST"){
            auto f=parseForm(req.body);const std::string user=f["username"],pass=f["password"];
            std::unique_ptr<User> account;
            if(user=="admin"&&pass=="admin123")account=std::make_unique<AdminUser>(user);
            else if(user=="doctor"&&pass=="doctor123")account=std::make_unique<DoctorUser>(user);
            else if(user=="reception"&&pass=="reception123")account=std::make_unique<ReceptionistUser>(user);
            else if(user=="patient"&&pass=="patient123")account=std::make_unique<PatientUser>(user);
            else return {401,"application/json","{\"error\":\"Invalid credentials\"}"};
            return {200,"application/json","{\"success\":true,\"username\":\""+jsonEscape(account->username())+"\",\"role\":\""+roleName(account->role())+"\",\"permissions\":\""+account->permissions()+"\"}"};
        }
        if(req.path=="/api/patients"&&req.method=="GET")return {200,"application/json",jsonArray(service_->patients(),patientJson)};
        if(req.path=="/api/patients"&&req.method=="POST"){
            auto f=parseForm(req.body);int id=service_->addPatient(f["name"],std::stoi(f["age"]),f["gender"],f["phone"],f["bloodGroup"],f["diagnosis"]);return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};
        }
        if(req.path.rfind("/api/patients/",0)==0&&req.method=="PUT") {
            int id=std::stoi(req.path.substr(14)); auto f=parseForm(req.body);
            return service_->updatePatient(id,f["name"],std::stoi(f["age"]),f["gender"],f["phone"],f["bloodGroup"],f["diagnosis"])
                ? HttpResponse{200,"application/json","{\"success\":true}"}
                : HttpResponse{404,"application/json","{\"error\":\"Patient not found\"}"};
        }
        if(req.path.rfind("/api/patients/",0)==0&&req.method=="DELETE"){
            int id=std::stoi(req.path.substr(14));return service_->deletePatient(id)?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Patient not found\"}"};
        }
        if(req.path=="/api/doctors"&&req.method=="GET")return {200,"application/json",jsonArray(service_->doctors(),doctorJson)};
        if(req.path=="/api/doctors"&&req.method=="POST"){auto f=parseForm(req.body);int id=service_->addDoctor(f["name"],f["specialty"],f["phone"],f["room"]);return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};}
        if(req.path=="/api/appointments"&&req.method=="GET")return {200,"application/json",jsonArray(service_->appointments(),appointmentJson)};
        if(req.path=="/api/appointments"&&req.method=="POST"){auto f=parseForm(req.body);int id=service_->addAppointment(std::stoi(f["patientId"]),std::stoi(f["doctorId"]),f["date"],f["time"]);return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};}
        if(req.path.rfind("/api/appointments/",0)==0&&req.method=="DELETE"){int id=std::stoi(req.path.substr(18));return service_->cancelAppointment(id)?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Appointment not found\"}"};}
        if(req.path=="/api/invoices"&&req.method=="GET")return {200,"application/json",jsonArray(service_->invoices(),invoiceJson)};
        if(req.path=="/api/invoices"&&req.method=="POST"){auto f=parseForm(req.body);int id=service_->addInvoice(std::stoi(f["patientId"]),std::stod(f["amount"]),f["description"]);return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};}
        if(req.path.rfind("/api/invoices/",0)==0&&req.method=="PUT"){int id=std::stoi(req.path.substr(14));return service_->payInvoice(id)?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Invoice not found\"}"};}
        if(req.path=="/api/records"&&req.method=="GET")return {200,"application/json",jsonArray(service_->records(),recordJson)};
        if(req.path=="/api/records"&&req.method=="POST"){auto f=parseForm(req.body);int id=service_->addRecord(std::stoi(f["patientId"]),std::stoi(f["doctorId"]),f["date"],f["diagnosis"],f["treatment"],f["notes"]);return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};}
        if(req.path=="/api/prescriptions"&&req.method=="GET")return {200,"application/json",jsonArray(service_->prescriptions(),prescriptionJson)};
        if(req.path=="/api/prescriptions"&&req.method=="POST"){auto f=parseForm(req.body);int id=service_->addPrescription(std::stoi(f["patientId"]),std::stoi(f["doctorId"]),f["medicine"],f["dosage"],f["duration"],f["date"]);return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};}
        if(req.path.rfind("/api/prescriptions/",0)==0&&req.method=="PUT"){int id=std::stoi(req.path.substr(19));return service_->dispensePrescription(id)?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Prescription not found\"}"};}
        if(req.path=="/api/medicines"&&req.method=="GET")return {200,"application/json",jsonArray(service_->medicines(),medicineJson)};
        if(req.path=="/api/medicines"&&req.method=="POST"){auto f=parseForm(req.body);int id=service_->addMedicine(f["name"],f["category"],std::stoi(f["stock"]),std::stod(f["price"]),std::stoi(f["reorderLevel"]));return {201,"application/json","{\"id\":"+std::to_string(id)+"}"};}
        if(req.path.rfind("/api/medicines/",0)==0&&req.method=="PUT"){int id=std::stoi(req.path.substr(15));auto f=parseForm(req.body);return service_->updateMedicineStock(id,std::stoi(f["stock"]))?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Medicine not found\"}"};}
        if(req.path=="/api/beds"&&req.method=="GET")return {200,"application/json",jsonArray(service_->beds(),bedJson)};
        if(req.path.rfind("/api/beds/",0)==0&&req.method=="PUT"){int id=std::stoi(req.path.substr(10));auto f=parseForm(req.body);if(f["action"]=="release")return service_->releaseBed(id)?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Bed not found\"}"};return service_->assignBed(id,std::stoi(f["patientId"]))?HttpResponse{200,"application/json","{\"success\":true}"}:HttpResponse{404,"application/json","{\"error\":\"Bed not found\"}"};}
        if(req.path=="/api/stats"&&req.method=="GET"){
            const auto p=service_->patients(); const auto d=service_->doctors(); const auto a=service_->appointments(); const auto i=service_->invoices();size_t unpaid=0;double revenue=0;for(const auto&x:i)if(x.paid())revenue+=x.amount();else ++unpaid;
            return {200,"application/json","{\"patients\":"+std::to_string(p.size())+",\"doctors\":"+std::to_string(d.size())+",\"appointments\":"+std::to_string(a.size())+",\"unpaidInvoices\":"+std::to_string(unpaid)+",\"revenue\":"+std::to_string(revenue)+"}"};
        }
        return staticFile(req.path);
    }

    HttpResponse staticFile(const std::string& path){
        std::string clean=path;if(clean=="/")clean="/index.html";if(clean.find("..")!=std::string::npos)return {400,"text/plain","Invalid path"};
        std::ifstream in(webRoot_+clean,std::ios::binary);if(!in)return {404,"text/plain","Not Found"};std::ostringstream ss;ss<<in.rdbuf();return {200,mimeType(clean),ss.str()};
    }
};

int main(int argc,char** argv){try{std::filesystem::create_directories("data");int port=8080;if(argc>1)port=std::stoi(argv[1]);Server server(port,"data","frontend");server.run();}catch(const std::exception&e){std::cerr<<"FATAL: "<<e.what()<<'\n';return 1;}return 0;}
