#include <iostream>
using namespace std;
class Base
{
private:
    int privateData;
protected:
    int protectedData;
public:
    int publicData;
    void setData()
    {
        privateData = 10;
        protectedData = 20;
        publicData = 30;
    }
    void displayBase()
    {
        cout << "Private Data: " << privateData << endl;
        cout << "Protected Data: " << protectedData << endl;
        cout << "Public Data: " << publicData << endl;
    }
};
class Derived : public Base
{
public:
    void displayDerived()
    {
        cout << "Protected Data in Derived Class: "
             << protectedData << endl;
        cout << "Public Data in Derived Class: "
             << publicData << endl;
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
         << d.publicData << endl;

    return 0;
}