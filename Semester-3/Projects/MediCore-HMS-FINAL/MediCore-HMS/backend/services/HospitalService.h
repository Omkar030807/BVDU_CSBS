#pragma once
#include "models/Patient.h"
#include "models/Doctor.h"
#include "models/Appointment.h"
#include "models/Invoice.h"
#include "models/MedicalRecord.h"
#include "models/Prescription.h"
#include "models/Medicine.h"
#include "models/Bed.h"
#include "repositories/FileRepository.h"
#include <algorithm>
#include <stdexcept>
#include <chrono>
#include <iomanip>
#include <sstream>
#include <mutex>

class HospitalService {
    mutable std::mutex writeMutex_;
    FileRepository<Patient> patients_;
    FileRepository<Doctor> doctors_;
    FileRepository<Appointment> appointments_;
    FileRepository<Invoice> invoices_;
    FileRepository<MedicalRecord> records_;
    FileRepository<Prescription> prescriptions_;
    FileRepository<Medicine> medicines_;
    FileRepository<Bed> beds_;
public:
    explicit HospitalService(const std::string& dataDir)
        : patients_(dataDir+"/patients.db", Patient::deserialize),
          doctors_(dataDir+"/doctors.db", Doctor::deserialize),
          appointments_(dataDir+"/appointments.db", Appointment::deserialize),
          invoices_(dataDir+"/invoices.db", Invoice::deserialize),
          records_(dataDir+"/records.db", MedicalRecord::deserialize),
          prescriptions_(dataDir+"/prescriptions.db", Prescription::deserialize),
          medicines_(dataDir+"/medicines.db", Medicine::deserialize),
          beds_(dataDir+"/beds.db", Bed::deserialize) {
        if (medicines_.all().empty()) { medicines_.add(Medicine(1,"Paracetamol","Analgesic",120,2.50,20)); medicines_.add(Medicine(2,"Amoxicillin","Antibiotic",65,6.75,15)); medicines_.add(Medicine(3,"Omeprazole","Gastric",18,4.20,20)); }
        if (beds_.all().empty()) { for(int i=1;i<=10;++i) beds_.add(Bed(i,"General","G-"+std::to_string(i))); for(int i=1;i<=4;++i) beds_.add(Bed(10+i,"ICU","I-"+std::to_string(i))); for(int i=1;i<=4;++i) beds_.add(Bed(14+i,"Emergency","E-"+std::to_string(i))); }
    }

    const auto patients() const { return patients_.all(); }
    const auto doctors() const { return doctors_.all(); }
    const auto appointments() const { return appointments_.all(); }
    const auto invoices() const { return invoices_.all(); }
    const auto records() const { return records_.all(); }
    const auto prescriptions() const { return prescriptions_.all(); }
    const auto medicines() const { return medicines_.all(); }
    const auto beds() const { return beds_.all(); }

    int addPatient(std::string name,int age,std::string gender,std::string phone,std::string blood,std::string diagnosis){
        std::lock_guard<std::mutex> guard(writeMutex_);
        validateName(name); if(age<0||age>130)throw std::invalid_argument("Invalid age"); if(phone.empty())throw std::invalid_argument("Phone is required");
        int id=patients_.nextId(); patients_.add(Patient(id,std::move(name),age,std::move(gender),std::move(phone),std::move(blood),std::move(diagnosis),now())); return id;
    }
    bool updatePatient(int id,std::string name,int age,std::string gender,std::string phone,std::string blood,std::string diagnosis){
        std::lock_guard<std::mutex> guard(writeMutex_);
        validateName(name); if(age<0||age>130) throw std::invalid_argument("Invalid age"); if(phone.empty()) throw std::invalid_argument("Phone is required"); return patients_.update(id,[&](Patient&p){p.setName(name);p.setAge(age);p.setGender(gender);p.setPhone(phone);p.setBloodGroup(blood);p.setDiagnosis(diagnosis);});
    }
    bool deletePatient(int id){
        std::lock_guard<std::mutex> guard(writeMutex_);return patients_.remove(id);}

    int addDoctor(std::string name,std::string specialty,std::string phone,std::string room){
        std::lock_guard<std::mutex> guard(writeMutex_);
        validateName(name); if(specialty.empty())throw std::invalid_argument("Specialty is required"); int id=doctors_.nextId();doctors_.add(Doctor(id,std::move(name),std::move(specialty),std::move(phone),std::move(room)));return id;
    }
    int addAppointment(int patientId,int doctorId,std::string date,std::string time){
        std::lock_guard<std::mutex> guard(writeMutex_);
        if(!existsPatient(patientId)||!existsDoctor(doctorId))throw std::invalid_argument("Patient or doctor not found");
        const auto a=appointments_.all(); if(std::any_of(a.begin(),a.end(),[&](const Appointment&x){return x.doctorId()==doctorId&&x.date()==date&&x.time()==time&&x.status()==AppointmentStatus::Scheduled;})) throw std::invalid_argument("Doctor already has an appointment at this time");
        int id=appointments_.nextId();appointments_.add(Appointment(id,patientId,doctorId,std::move(date),std::move(time),AppointmentStatus::Scheduled));return id;
    }
    bool cancelAppointment(int id){
        std::lock_guard<std::mutex> guard(writeMutex_);return appointments_.update(id,[](Appointment&a){a.setStatus(AppointmentStatus::Cancelled);});}
    int addInvoice(int patientId,double amount,std::string description){
        std::lock_guard<std::mutex> guard(writeMutex_);if(!existsPatient(patientId)||amount<0)throw std::invalid_argument("Invalid invoice");int id=invoices_.nextId();invoices_.add(Invoice(id,patientId,amount,std::move(description),false));return id;}
    bool payInvoice(int id){
        std::lock_guard<std::mutex> guard(writeMutex_);return invoices_.update(id,[](Invoice&i){i.setPaid(true);});}
    int addRecord(int patientId,int doctorId,std::string date,std::string diagnosis,std::string treatment,std::string notes){
        std::lock_guard<std::mutex> guard(writeMutex_);
        if(!existsPatient(patientId)||!existsDoctor(doctorId)) throw std::invalid_argument("Patient or doctor not found");
        int id=records_.nextId(); records_.add(MedicalRecord(id,patientId,doctorId,std::move(date),std::move(diagnosis),std::move(treatment),std::move(notes))); return id;
    }
    int addPrescription(int patientId,int doctorId,std::string medicine,std::string dosage,std::string duration,std::string date){
        std::lock_guard<std::mutex> guard(writeMutex_);
        if(!existsPatient(patientId)||!existsDoctor(doctorId)||medicine.empty()) throw std::invalid_argument("Invalid prescription");
        int id=prescriptions_.nextId(); prescriptions_.add(Prescription(id,patientId,doctorId,std::move(medicine),std::move(dosage),std::move(duration),std::move(date))); return id;
    }
    bool dispensePrescription(int id){
        std::lock_guard<std::mutex> guard(writeMutex_);return prescriptions_.update(id,[&](Prescription&p){if(p.dispensed()) return; p.setDispensed(true);});}
    int addMedicine(std::string name,std::string category,int stock,double price,int reorder){
        std::lock_guard<std::mutex> guard(writeMutex_);if(name.empty()||stock<0||price<0||reorder<0)throw std::invalid_argument("Invalid medicine");int id=medicines_.nextId();medicines_.add(Medicine(id,std::move(name),std::move(category),stock,price,reorder));return id;}
    bool updateMedicineStock(int id,int stock){
        std::lock_guard<std::mutex> guard(writeMutex_);if(stock<0)throw std::invalid_argument("Stock cannot be negative");return medicines_.update(id,[&](Medicine&m){m.setStock(stock);});}
    bool assignBed(int id,int patientId){
        std::lock_guard<std::mutex> guard(writeMutex_);if(!existsPatient(patientId))throw std::invalid_argument("Patient not found");return beds_.update(id,[&](Bed&b){if(b.status()!=BedStatus::Available)throw std::invalid_argument("Bed is not available");b.setPatientId(patientId);b.setStatus(BedStatus::Occupied);});}
    bool releaseBed(int id){
        std::lock_guard<std::mutex> guard(writeMutex_);return beds_.update(id,[](Bed&b){b.setPatientId(0);b.setStatus(BedStatus::Available);});}


    bool existsPatient(int id)const{const auto v=patients_.all();return std::any_of(v.begin(),v.end(),[&](const Patient&p){return p.id()==id;});}
    bool existsDoctor(int id)const{const auto v=doctors_.all();return std::any_of(v.begin(),v.end(),[&](const Doctor&d){return d.id()==id;});}
private:
    static void validateName(const std::string& name){if(name.size()<2||name.size()>80)throw std::invalid_argument("Name must contain 2-80 characters");}
    static std::string now(){auto t=std::chrono::system_clock::to_time_t(std::chrono::system_clock::now());std::tm tm{};
#ifdef _WIN32
        localtime_s(&tm,&t);
#else
        localtime_r(&t,&tm);
#endif
        std::ostringstream o;o<<std::put_time(&tm,"%Y-%m-%d %H:%M:%S");return o.str();}
};
