#include "services/HospitalService.h"
#include <cassert>
#include <filesystem>
#include <iostream>
#include <stdexcept>
#include <cstdlib>
#define REQUIRE(x) do { if(!(x)) { std::cerr << "FAIL: " << #x << "\n"; return 1; } } while(0)

int main() {
    const std::string dir = "test_data";
    std::filesystem::remove_all(dir);
    HospitalService h(dir);

    int p = h.addPatient("Test Patient", 25, "Male", "9999999999", "O+", "Fever");
    int d = h.addDoctor("Dr Test", "Cardiology", "8888888888", "101");
    REQUIRE(p == 1 && d == 1);
    REQUIRE(h.patients().size() == 1 && h.doctors().size() == 1);

    bool badAge = false;
    try { h.addPatient("Bad", 200, "Male", "1", "O+", ""); }
    catch (const std::invalid_argument&) { badAge = true; }
    REQUIRE(badAge);

    int a = h.addAppointment(p, d, "2026-09-30", "10:00");
    REQUIRE(a == 1);
    bool conflict = false;
    try { h.addAppointment(p, d, "2026-09-30", "10:00"); }
    catch (const std::exception&) { conflict = true; }
    REQUIRE(conflict);

    int r = h.addRecord(p, d, "2026-09-30", "Flu", "Rest", "Hydrate");
    int rx = h.addPrescription(p, d, "Paracetamol", "1 tablet", "5 days", "2026-09-30");
    int inv = h.addInvoice(p, 500.0, "Consultation");
    REQUIRE(r == 1 && rx == 1 && inv == 1);
    REQUIRE(h.payInvoice(inv));
    REQUIRE(h.dispensePrescription(rx));

    REQUIRE(h.updatePatient(p, "Updated Patient", 26, "Male", "9999999999", "O+", "Recovered"));
    REQUIRE(h.patients().front().name() == "Updated Patient");

    REQUIRE(h.updateMedicineStock(1, 5));
    REQUIRE(h.medicines().front().stock() == 5);

    REQUIRE(h.assignBed(1, p));
    REQUIRE(h.beds().front().patientId() == p);
    REQUIRE(h.releaseBed(1));
    REQUIRE(h.beds().front().patientId() == 0);

    REQUIRE(h.cancelAppointment(a));
    REQUIRE(h.deletePatient(p));
    REQUIRE(h.patients().empty());

    std::cout << "ALL C++ SERVICE TESTS PASSED\n";
    std::filesystem::remove_all(dir);
}
