#pragma once
#include <string>
#include <sstream>
#include <vector>
#include <stdexcept>

enum class AppointmentStatus { Scheduled, Completed, Cancelled };

inline std::string toString(AppointmentStatus s) {
    switch (s) { case AppointmentStatus::Scheduled: return "Scheduled"; case AppointmentStatus::Completed: return "Completed"; default: return "Cancelled"; }
}
inline AppointmentStatus appointmentStatusFromString(const std::string& s) {
    if (s == "Completed") return AppointmentStatus::Completed;
    if (s == "Cancelled") return AppointmentStatus::Cancelled;
    return AppointmentStatus::Scheduled;
}

class Appointment {
    int id_{};
    int patientId_{};
    int doctorId_{};
    std::string date_;
    std::string time_;
    AppointmentStatus status_{AppointmentStatus::Scheduled};
public:
    Appointment() = default;
    Appointment(int id,int patientId,int doctorId,std::string date,std::string time,AppointmentStatus status)
        : id_(id),patientId_(patientId),doctorId_(doctorId),date_(std::move(date)),time_(std::move(time)),status_(status) {}
    int id() const { return id_; }
    int patientId() const { return patientId_; }
    int doctorId() const { return doctorId_; }
    const std::string& date() const { return date_; }
    const std::string& time() const { return time_; }
    AppointmentStatus status() const { return status_; }
    void setStatus(AppointmentStatus s) { status_=s; }
    std::string serialize() const {
        return std::to_string(id_)+"\t"+std::to_string(patientId_)+"\t"+std::to_string(doctorId_)+"\t"+date_+"\t"+time_+"\t"+toString(status_);
    }
    static Appointment deserialize(const std::string& line) {
        std::stringstream ss(line); std::string x; std::vector<std::string> f;
        while(std::getline(ss,x,'\t')) f.push_back(x);
        if(f.size()!=6) throw std::runtime_error("Invalid appointment record");
        return Appointment(std::stoi(f[0]),std::stoi(f[1]),std::stoi(f[2]),f[3],f[4],appointmentStatusFromString(f[5]));
    }
};
