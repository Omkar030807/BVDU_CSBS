#include <iostream>
using namespace std;
class Base
{
private:
    int a;
protected:
    int b;
public:
    int c;
    void setData()
    {
        a = 10;
        b = 20;
        c = 30;
    }
    void displayBase()
    {
        cout << "Private : " << a << endl;
        cout << "Protected : " << b << endl;
        cout << "Public : " << c << endl;
    }
};
class Derived : public Base
{
public:
    void displayDerived()
    {
        cout << "Protected Data in Derived Class: "
             << b << endl;
        cout << "Public Data in Derived Class: "
             << c << endl;
    }
};
int main()
{
    Derived d;
    d.setData();
    cout << "Accessing data using Base class function:" << endl;
    d.displayBase();
    cout << "\nAccessing data in Derived class:" << endl;
    d.displayDerived();
    cout << "\nAccessing public data from main(): "
         << d.c << endl;
    return 0;
}