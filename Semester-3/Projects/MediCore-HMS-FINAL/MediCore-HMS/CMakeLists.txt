cmake_minimum_required(VERSION 3.20)
project(MediCoreHMS VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if(MSVC)
    add_compile_options(/W4 /permissive-)
else()
    add_compile_options(-Wall -Wextra -Wpedantic)
endif()

file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS
    "backend/*.cpp"
)

add_executable(medicore ${SOURCES})
target_include_directories(medicore PRIVATE backend)

if(WIN32)
    target_link_libraries(medicore PRIVATE ws2_32)
else()
    find_package(Threads REQUIRED)
    target_link_libraries(medicore PRIVATE Threads::Threads)
endif()

add_custom_command(TARGET medicore POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
            "${CMAKE_SOURCE_DIR}/frontend"
            "$<TARGET_FILE_DIR:medicore>/frontend"
    COMMAND ${CMAKE_COMMAND} -E make_directory
            "$<TARGET_FILE_DIR:medicore>/data"
)

option(BUILD_TESTS "Build MediCore tests" ON)
if(BUILD_TESTS)
    enable_testing()
    add_executable(medicore_tests tests/test_service.cpp)
    target_include_directories(medicore_tests PRIVATE backend)
    if(WIN32)
        target_link_libraries(medicore_tests PRIVATE ws2_32)
    else()
        find_package(Threads REQUIRED)
        target_link_libraries(medicore_tests PRIVATE Threads::Threads)
    endif()
    add_test(NAME MediCoreServiceTests COMMAND medicore_tests)
endif()
