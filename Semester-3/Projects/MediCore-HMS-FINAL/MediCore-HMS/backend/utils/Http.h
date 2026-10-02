#pragma once
#include <string>
#include <unordered_map>
#include <functional>
#include <sstream>
#include <vector>

struct HttpRequest {
    std::string method;
    std::string path;
    std::unordered_map<std::string, std::string> headers;
    std::string body;
};

struct HttpResponse {
    int status = 200;
    std::string contentType = "application/json";
    std::string body;
};

inline std::string jsonEscape(const std::string& s) {
    std::string out;
    out.reserve(s.size() + 8);
    for (char c : s) {
        switch (c) {
            case '"': out += "\\\""; break;
            case '\\': out += "\\\\"; break;
            case '\n': out += "\\n"; break;
            case '\r': out += "\\r"; break;
            case '\t': out += "\\t"; break;
            default: out += c;
        }
    }
    return out;
}

inline std::string urlDecode(const std::string& s) {
    std::string out;
    for (size_t i = 0; i < s.size(); ++i) {
        if (s[i] == '%' && i + 2 < s.size()) {
            try {
                int v = std::stoi(s.substr(i + 1, 2), nullptr, 16);
                out += static_cast<char>(v);
                i += 2;
            } catch (...) { out += s[i]; }
        } else if (s[i] == '+') out += ' ';
        else out += s[i];
    }
    return out;
}

inline std::unordered_map<std::string, std::string> parseForm(const std::string& body) {
    std::unordered_map<std::string, std::string> result;
    std::stringstream ss(body);
    std::string item;
    while (std::getline(ss, item, '&')) {
        const auto eq = item.find('=');
        if (eq == std::string::npos) continue;
        result[urlDecode(item.substr(0, eq))] = urlDecode(item.substr(eq + 1));
    }
    return result;
}

inline std::string statusText(int status) {
    switch (status) {
        case 200: return "OK";
        case 201: return "Created";
        case 400: return "Bad Request";
        case 401: return "Unauthorized";
        case 404: return "Not Found";
        case 405: return "Method Not Allowed";
        case 500: return "Internal Server Error";
        default: return "OK";
    }
}
