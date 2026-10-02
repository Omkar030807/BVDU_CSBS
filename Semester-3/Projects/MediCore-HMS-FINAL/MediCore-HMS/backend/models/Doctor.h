#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>

class Doctor {
    int id_{};
    std::string name_;
    std::string specialty_;
    std::string phone_;
    std::string room_;
    bool available_{true};
public:
    Doctor() = default;
    Doctor(int id, std::string name, std::string specialty, std::string phone, std::string room, bool available=true)
        : id_(id), name_(std::move(name)), specialty_(std::move(specialty)), phone_(std::move(phone)), room_(std::move(room)), available_(available) {}
    int id() const { return id_; }
    const std::string& name() const { return name_; }
    const std::string& specialty() const { return specialty_; }
    const std::string& phone() const { return phone_; }
    const std::string& room() const { return room_; }
    bool available() const { return available_; }
    void setAvailable(bool v) { available_ = v; }
    std::string serialize() const {
        return std::to_string(id_) + "\t" + name_ + "\t" + specialty_ + "\t" + phone_ + "\t" + room_ + "\t" + (available_ ? "1" : "0");
    }
    static Doctor deserialize(const std::string& line) {
        std::stringstream ss(line); std::string x; std::vector<std::string> f;
        while (std::getline(ss, x, '\t')) f.push_back(x);
        if (f.size()!=6) throw std::runtime_error("Invalid doctor record");
        return Doctor(std::stoi(f[0]),f[1],f[2],f[3],f[4],f[5]=="1");
    }
};
