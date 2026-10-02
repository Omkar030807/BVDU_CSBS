#pragma once
#include <fstream>
#include <mutex>
#include <string>
#include <vector>
#include <functional>
#include <algorithm>

// Generic repository: demonstrates templates, RAII, references and STL algorithms.
template <typename T>
class FileRepository {
    std::string path_;
    std::vector<T> items_;
    mutable std::mutex mutex_;
    std::function<T(const std::string&)> decoder_;
public:
    FileRepository(std::string path, std::function<T(const std::string&)> decoder)
        : path_(std::move(path)), decoder_(std::move(decoder)) { load(); }

    std::vector<T> all() const { std::lock_guard<std::mutex> lock(mutex_); return items_; }

    void add(T item) { std::lock_guard<std::mutex> lock(mutex_); items_.push_back(std::move(item)); saveUnlocked(); }

    bool update(int id, const std::function<void(T&)>& updater) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto it=std::find_if(items_.begin(),items_.end(),[&](const T& x){return x.id()==id;});
        if(it==items_.end()) return false;
        updater(*it);
        saveUnlocked();
        return true;
    }

    bool remove(int id) {
        std::lock_guard<std::mutex> lock(mutex_);
        auto old=items_.size(); items_.erase(std::remove_if(items_.begin(),items_.end(),[&](const T& x){return x.id()==id;}),items_.end());
        if(items_.size()!=old){saveUnlocked();return true;} return false;
    }

    int nextId() const { std::lock_guard<std::mutex> lock(mutex_); int maxId=0; for(const auto& x:items_) maxId=std::max(maxId,x.id()); return maxId+1; }

private:
    void load(){std::lock_guard<std::mutex>lock(mutex_);std::ifstream in(path_);std::string line;while(std::getline(in,line)){if(line.empty())continue;try{items_.push_back(decoder_(line));}catch(...){}}}
    void saveUnlocked() const {std::ofstream out(path_,std::ios::trunc);for(const auto& x:items_)out<<x.serialize()<<'\n';}
};
