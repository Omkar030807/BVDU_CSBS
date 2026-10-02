#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>
class MedicalRecord { int id_{}; int patientId_{}; int doctorId_{}; std::string date_,diagnosis_,treatment_,notes_;
public:
 MedicalRecord()=default; MedicalRecord(int id,int p,int d,std::string date,std::string diagnosis,std::string treatment,std::string notes):id_(id),patientId_(p),doctorId_(d),date_(std::move(date)),diagnosis_(std::move(diagnosis)),treatment_(std::move(treatment)),notes_(std::move(notes)){}
 int id()const{return id_;} int patientId()const{return patientId_;} int doctorId()const{return doctorId_;} const std::string& date()const{return date_;} const std::string& diagnosis()const{return diagnosis_;} const std::string& treatment()const{return treatment_;} const std::string& notes()const{return notes_;}
 std::string serialize()const{return std::to_string(id_)+'\t'+std::to_string(patientId_)+'\t'+std::to_string(doctorId_)+'\t'+date_+'\t'+diagnosis_+'\t'+treatment_+'\t'+notes_;}
 static MedicalRecord deserialize(const std::string& line){std::stringstream s(line);std::string x;std::vector<std::string>f;while(std::getline(s,x,'\t'))f.push_back(x);if(f.size()!=7)throw std::runtime_error("Invalid medical record");return MedicalRecord(std::stoi(f[0]),std::stoi(f[1]),std::stoi(f[2]),f[3],f[4],f[5],f[6]);}
};
