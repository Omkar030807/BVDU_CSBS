#include <iostream>
using namespace std;
class Person
{
protected:
    string name;
    int age;
public:
    Person(string name, int age)
    {
        // Demonstration of 'this' pointer
        this->name = name;
        this->age = age;
    }
    virtual void display()
    {
        cout << "Name: " << name << endl;
        cout << "Age: " << age << endl;
    }

    // Friend Function declaration
    friend void showDetails(Person);
};
class Student : public Person
{
private:
    int rollNo;
    string course;

public:
    Student(string name, int age, int rollNo, string course)
        : Person(name, age)
    {
        this->rollNo = rollNo;
        this->course = course;
    }
    void display() override
    {
        cout << "\n- Student Details -" << endl;
        cout << "Name: " << name << endl;
        cout << "Age: " << age << endl;
        cout << "Roll No: " << rollNo << endl;
        cout << "Course: " << course << endl;
    }
    friend class StudentHelper;
};
void showDetails(Person p)
{
    cout << "\n- Friend Function -" << endl;
    cout << "Name: " << p.name << endl;
    cout << "Age: " << p.age << endl;
}
class StudentHelper
{
public:
    void showStudentDetails(Student s)
    {
        cout << "\n- Friend Class -" << endl;
        cout << "Name: " << s.name << endl;
        cout << "Age: " << s.age << endl;
        cout << "Roll No: " << s.rollNo << endl;
        cout << "Course: " << s.course << endl;
    }
};
int main()
{
    Student s("Omkar", 19, 66, "CSBS");
    Person *ptr;
    ptr = &s;
    cout << "- Virtual Function -" << endl;
    ptr->display();
    showDetails(s);
    StudentHelper helper;
    helper.showStudentDetails(s);
    return 0;
}