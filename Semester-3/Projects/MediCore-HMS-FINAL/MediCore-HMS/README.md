# MediCore HMS

A C++17 Hospital Management System with a browser-based interface. The backend is written in C++ and uses a small dependency-free HTTP server built on the platform socket API. Records persist to local files through a generic repository layer.

## Features

- Role-based demo login: Admin, Doctor, Receptionist, Patient
- Dashboard and live statistics
- Patient CRUD with search
- Doctor directory
- Appointment scheduling and conflict detection
- Medical records
- Prescriptions and dispensing status
- Pharmacy inventory and stock updates
- Ward and bed assignment/release
- Billing and payment status
- Reports page
- Request validation and meaningful HTTP error codes
- Thread-per-connection server model
- Persistent local data files
- CMake + VS Code friendly structure

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | admin | admin123 |
| Doctor | doctor | doctor123 |
| Receptionist | reception | reception123 |
| Patient | patient | patient123 |

These are demonstration credentials for a college project, not production authentication.

## Windows / VS Code

1. Install CMake and a C++17 compiler (Visual Studio Build Tools or MinGW-w64).
2. Open this folder in VS Code.
3. Run `build.bat`, or use the CMake Tools extension.
4. Run `build\Release\medicore.exe`.
5. Open `http://localhost:8080`.

The server accepts an optional port: `medicore.exe 8081`.

## Tests

The project includes CTest service-level tests. The final verification also exercised the HTTP API end-to-end: health check, all four demo logins, invalid login, patient create/update/validation, doctor creation, appointment creation/conflict/cancel, medical records, prescriptions/dispensing, medicine stock, invoices/payment, bed assignment/conflict/release, static frontend serving, statistics, and persistence after server restart.

Final local verification:

- CMake Debug build: PASS
- CTest: 1/1 PASS
- JavaScript syntax check: PASS
- HTTP integration suite: PASS
- Persistence/restart test: PASS

## C++ concepts demonstrated

See `docs/CPP_CONCEPT_MAP.md` for the mapping. The project intentionally uses classes/objects, constructors/destructors, encapsulation, inheritance, runtime polymorphism, virtual functions, templates, STL containers, iterators, algorithms, lambdas, smart pointers, references, `const`, enums, exceptions, RAII, file I/O, mutexes/threads, `chrono`, move semantics, namespaces, and CMake.

## Project layout

```text
MediCore-HMS/
├── backend/
│   ├── main.cpp
│   ├── models/
│   ├── repositories/
│   ├── services/
│   └── utils/
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
├── tests/
│   └── test_service.cpp
├── docs/
├── CMakeLists.txt
├── build.bat
└── run.bat
```
