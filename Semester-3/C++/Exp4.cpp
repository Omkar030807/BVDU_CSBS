#include <iostream>
using namespace std;
class Student
{
    int rollNo;
    string name;
    float marks;
public:
    void input()
    {
        cout << "Enter Roll Number: ";
        cin >> rollNo;
        cout << "Enter Name: ";
        cin >> name;
        cout << "Enter Marks: ";
        cin >> marks;
    }
    void display()
    {
        cout << "\nStudent Details:" << endl;
        cout << "Roll Number: " << rollNo << endl;
        cout << "Name: " << name << endl;
        cout << "Marks: " << marks << endl;
    }
};
int main()
{
    Student s1;
    s1.input();
    s1.display();
    return 0;
}