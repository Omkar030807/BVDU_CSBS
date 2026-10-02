#pragma once
#include <fstream>
#include <iostream>
#include <mutex>
#include <string>
#include <chrono>
#include <iomanip>

class Logger {
    std::ofstream file;
    std::mutex mutex;
public:
    explicit Logger(const std::string& path) : file(path, std::ios::app) {}
    void info(const std::string& message) { write("INFO", message); }
    void error(const std::string& message) { write("ERROR", message); }
private:
    void write(const std::string& level, const std::string& message) {
        std::lock_guard<std::mutex> lock(mutex);
        const auto now = std::chrono::system_clock::now();
        const auto tt = std::chrono::system_clock::to_time_t(now);
        std::tm tm{};
#ifdef _WIN32
        localtime_s(&tm, &tt);
#else
        localtime_r(&tt, &tm);
#endif
        std::ostringstream stamp;
        stamp << std::put_time(&tm, "%Y-%m-%d %H:%M:%S");
        const std::string line = "[" + stamp.str() + "] [" + level + "] " + message;
        std::cout << line << '\n';
        if (file) file << line << '\n';
    }
};
