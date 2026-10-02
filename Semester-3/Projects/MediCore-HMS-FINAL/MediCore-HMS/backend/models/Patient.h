#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>

class Patient {
    int id_{};
    std::string name_;
    int age_{};
    std::string gender_;
    std::string phone_;
    std::string bloodGroup_;
    std::string diagnosis_;
    std::string createdAt_;
public:
    Patient() = default;
    Patient(int id, std::string name, int age, std::string gender,
            std::string phone, std::string bloodGroup,
            std::string diagnosis, std::string createdAt)
        : id_(id), name_(std::move(name)), age_(age), gender_(std::move(gender)),
          phone_(std::move(phone)), bloodGroup_(std::move(bloodGroup)),
          diagnosis_(std::move(diagnosis)), createdAt_(std::move(createdAt)) {}

    int id() const { return id_; }
    const std::string& name() const { return name_; }
    int age() const { return age_; }
    const std::string& gender() const { return gender_; }
    const std::string& phone() const { return phone_; }
    const std::string& bloodGroup() const { return bloodGroup_; }
    const std::string& diagnosis() const { return diagnosis_; }
    const std::string& createdAt() const { return createdAt_; }

    void setName(std::string v) { name_ = std::move(v); }
    void setAge(int v) { age_ = v; }
    void setGender(std::string v) { gender_ = std::move(v); }
    void setPhone(std::string v) { phone_ = std::move(v); }
    void setBloodGroup(std::string v) { bloodGroup_ = std::move(v); }
    void setDiagnosis(std::string v) { diagnosis_ = std::move(v); }

    std::string serialize() const {
        std::ostringstream out;
        out << id_ << '\t' << name_ << '\t' << age_ << '\t' << gender_ << '\t'
            << phone_ << '\t' << bloodGroup_ << '\t' << diagnosis_ << '\t' << createdAt_;
        return out.str();
    }

    static Patient deserialize(const std::string& line) {
        std::stringstream ss(line);
        std::string field;
        std::vector<std::string> f;
        while (std::getline(ss, field, '\t')) f.push_back(field);
        if (f.size() != 8) throw std::runtime_error("Invalid patient record");
        return Patient(std::stoi(f[0]), f[1], std::stoi(f[2]), f[3], f[4], f[5], f[6], f[7]);
    }
};
