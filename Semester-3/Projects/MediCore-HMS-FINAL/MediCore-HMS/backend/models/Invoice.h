#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>

class Invoice {
    int id_{}; int patientId_{}; double amount_{}; std::string description_; bool paid_{};
public:
    Invoice()=default;
    Invoice(int id,int patientId,double amount,std::string description,bool paid)
        :id_(id),patientId_(patientId),amount_(amount),description_(std::move(description)),paid_(paid){}
    int id() const{return id_;} int patientId()const{return patientId_;} double amount()const{return amount_;}
    const std::string& description()const{return description_;} bool paid()const{return paid_;}
    void setPaid(bool v){paid_=v;}
    std::string serialize()const{return std::to_string(id_)+"\t"+std::to_string(patientId_)+"\t"+std::to_string(amount_)+"\t"+description_+"\t"+(paid_?"1":"0");}
    static Invoice deserialize(const std::string& line){std::stringstream ss(line);std::string x;std::vector<std::string>f;while(std::getline(ss,x,'\t'))f.push_back(x);if(f.size()!=5)throw std::runtime_error("Invalid invoice record");return Invoice(std::stoi(f[0]),std::stoi(f[1]),std::stod(f[2]),f[3],f[4]=="1");}
};
