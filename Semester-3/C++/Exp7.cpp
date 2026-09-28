#include <iostream>
#include <string>
using namespace std;
class Person
{
protected:
    string name;
    int age;
    string address;

public:
    void setPersonDetails(string n, int a, string addr)
    {
        name = n;
        age = a;
        address = addr;
    }
    void displayPersonDetails()
    {
        cout << "Name    : " << name << endl;
        cout << "Age     : " << age << endl;
        cout << "Address : " << address << endl;
    }
};
class Student : public Person
{
private:
    int rollNo;
    string course;
public:
    void setStudentDetails(string n, int a, string addr,
                           int r, string c)
    {
        setPersonDetails(n, a, addr);
        rollNo = r;
        course = c;
    }
    void displayStudent()
    {
        cout << "\n- Student Details -" << endl;
        displayPersonDetails();
        cout << "Roll No : " << rollNo << endl;
        cout << "Course  : " << course << endl;
    }
};
class Professor : public Person
{
private:
    int employeeID;
    string department;
public:
    void setProfessorDetails(string n, int a, string addr,int id, string dept)
    {
        setPersonDetails(n, a, addr);
        employeeID = id;
        department = dept;
    }
    void displayProfessor()
    {
        cout << "\n- Professor Details -" << endl;
        displayPersonDetails();
        cout << "Employee ID : " << employeeID << endl;
        cout << "Department  : " << department << endl;
    }
};
int main()
{
    Student s1, s2;
    s1.setStudentDetails(
        "Soham", 20, "Pune", 101, "Computer Science");
    s2.setStudentDetails(
        "Lalit", 21, "Mumbai", 102, "Information Technology");
    Professor p1, p2;
    p1.setProfessorDetails(
        "Dr. Amit", 45, "Pune", 501, "Computer Science");
    p2.setProfessorDetails(
        "Dr. Neha", 42, "Nashik", 502, "Information Technology");
    s1.displayStudent();
    s2.displayStudent();
    p1.displayProfessor();
    p2.displayProfessor();
    return 0;
}