#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>
class Medicine { int id_{}; std::string name_,category_; int stock_{}; double price_{}; int reorderLevel_{};
public:
 Medicine()=default; Medicine(int id,std::string name,std::string category,int stock,double price,int reorder):id_(id),name_(std::move(name)),category_(std::move(category)),stock_(stock),price_(price),reorderLevel_(reorder){}
 int id()const{return id_;} const std::string& name()const{return name_;} const std::string& category()const{return category_;} int stock()const{return stock_;} double price()const{return price_;} int reorderLevel()const{return reorderLevel_;} void setStock(int v){stock_=v;}
 std::string serialize()const{return std::to_string(id_)+'\t'+name_+'\t'+category_+'\t'+std::to_string(stock_)+'\t'+std::to_string(price_)+'\t'+std::to_string(reorderLevel_);}
 static Medicine deserialize(const std::string& line){std::stringstream s(line);std::string x;std::vector<std::string>f;while(std::getline(s,x,'\t'))f.push_back(x);if(f.size()!=6)throw std::runtime_error("Invalid medicine");return Medicine(std::stoi(f[0]),f[1],f[2],std::stoi(f[3]),std::stod(f[4]),std::stoi(f[5]));}
};
