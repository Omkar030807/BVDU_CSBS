#pragma once
#include <string>
#include <memory>

enum class Role { Admin, Doctor, Receptionist, Patient };
inline std::string roleName(Role r){switch(r){case Role::Admin:return "Admin";case Role::Doctor:return "Doctor";case Role::Receptionist:return "Receptionist";default:return "Patient";}}

class User {
protected:
    std::string username_;
public:
    explicit User(std::string username):username_(std::move(username)){}
    virtual ~User()=default;
    virtual Role role() const=0;
    virtual std::string permissions() const=0;
    const std::string& username() const{return username_;}
};
class AdminUser:public User{public:using User::User;Role role()const override{return Role::Admin;}std::string permissions()const override{return "all";}};
class DoctorUser:public User{public:using User::User;Role role()const override{return Role::Doctor;}std::string permissions()const override{return "patients,appointments,records";}};
class ReceptionistUser:public User{public:using User::User;Role role()const override{return Role::Receptionist;}std::string permissions()const override{return "patients,appointments,billing";}};
class PatientUser:public User{public:using User::User;Role role()const override{return Role::Patient;}std::string permissions()const override{return "appointments,records";}};
