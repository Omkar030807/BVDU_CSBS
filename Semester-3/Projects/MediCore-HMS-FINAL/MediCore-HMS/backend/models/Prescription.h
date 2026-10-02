#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>
class Prescription { int id_{}; int patientId_{}; int doctorId_{}; std::string medicine_,dosage_,duration_,date_; bool dispensed_{};
public:
 Prescription()=default; Prescription(int id,int p,int d,std::string medicine,std::string dosage,std::string duration,std::string date,bool dispensed=false):id_(id),patientId_(p),doctorId_(d),medicine_(std::move(medicine)),dosage_(std::move(dosage)),duration_(std::move(duration)),date_(std::move(date)),dispensed_(dispensed){}
 int id()const{return id_;} int patientId()const{return patientId_;} int doctorId()const{return doctorId_;} const std::string& medicine()const{return medicine_;} const std::string& dosage()const{return dosage_;} const std::string& duration()const{return duration_;} const std::string& date()const{return date_;} bool dispensed()const{return dispensed_;} void setDispensed(bool v){dispensed_=v;}
 std::string serialize()const{return std::to_string(id_)+'\t'+std::to_string(patientId_)+'\t'+std::to_string(doctorId_)+'\t'+medicine_+'\t'+dosage_+'\t'+duration_+'\t'+date_+'\t'+(dispensed_?"1":"0");}
 static Prescription deserialize(const std::string& line){std::stringstream s(line);std::string x;std::vector<std::string>f;while(std::getline(s,x,'\t'))f.push_back(x);if(f.size()!=8)throw std::runtime_error("Invalid prescription");return Prescription(std::stoi(f[0]),std::stoi(f[1]),std::stoi(f[2]),f[3],f[4],f[5],f[6],f[7]=="1");}
};
