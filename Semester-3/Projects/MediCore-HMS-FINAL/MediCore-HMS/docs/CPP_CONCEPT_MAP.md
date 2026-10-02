# C++ Concept Map - MediCore HMS

| C++ concept | Project location | Purpose |
|---|---|---|
| Class / Object | `backend/models/*.h` | Domain objects |
| Encapsulation | model private members | Controlled state |
| Constructors | model classes | Safe object initialization |
| Destructors | `User` virtual destructor | Polymorphic cleanup |
| Inheritance | `models/User.h` | User role hierarchy |
| Runtime polymorphism | `User::role()` / `permissions()` | Role-specific behavior |
| Abstract class | `User` pure virtual methods | Common user contract |
| Smart pointers | `main.cpp` | Ownership of user/service objects |
| Templates | `repositories/FileRepository.h` | Generic persistence |
| STL vector | repositories/services | Dynamic collections |
| STL algorithms | service/repository | `find_if`, `any_of`, `remove_if`, `max` |
| Lambda expressions | repository/service | Predicates and updates |
| enum class | `AppointmentStatus`, `Role` | Type-safe states |
| Exceptions | service/main | Validation and error handling |
| File I/O | repository/logger | Persistence and logs |
| RAII | `Logger`, repository locking | Resource lifetime management |
| Mutex / threads | repository/server | Safe concurrent access |
| References | service/repository functions | Avoid unnecessary copies |
| const correctness | getters/service reads | Prevent accidental mutation |
| chrono | appointment/log timestamps | Date/time handling |
| CMake | root `CMakeLists.txt` | Reproducible build |
| Socket programming | `main.cpp` | C++ HTTP server |
