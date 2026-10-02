#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>
enum class BedStatus{Available,Occupied,Maintenance}; inline std::string bedStatusName(BedStatus s){return s==BedStatus::Available?"Available":s==BedStatus::Occupied?"Occupied":"Maintenance";}
class Bed { int id_{}; std::string ward_,number_; BedStatus status_{BedStatus::Available}; int patientId_{};
public:
 Bed()=default; Bed(int id,std::string ward,std::string number,BedStatus status=BedStatus::Available,int patientId=0):id_(id),ward_(std::move(ward)),number_(std::move(number)),status_(status),patientId_(patientId){}
 int id()const{return id_;} const std::string& ward()const{return ward_;} const std::string& number()const{return number_;} BedStatus status()const{return status_;} int patientId()const{return patientId_;} void setStatus(BedStatus s){status_=s;} void setPatientId(int p){patientId_=p;}
 std::string serialize()const{return std::to_string(id_)+'\t'+ward_+'\t'+number_+'\t'+bedStatusName(status_)+'\t'+std::to_string(patientId_);}
 static Bed deserialize(const std::string& line){std::stringstream s(line);std::string x;std::vector<std::string>f;while(std::getline(s,x,'\t'))f.push_back(x);if(f.size()!=5)throw std::runtime_error("Invalid bed");BedStatus st=f[3]=="Occupied"?BedStatus::Occupied:f[3]=="Maintenance"?BedStatus::Maintenance:BedStatus::Available;return Bed(std::stoi(f[0]),f[1],f[2],st,std::stoi(f[4]));}
};
