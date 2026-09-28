#include <iostream>
using namespace std;
class Number
{
private:
    int value;
public:
    // Constructor
    Number(int v = 0)
    {
        value = v;
    }
    // Function Overloading
    int add(int a, int b)
    {
        return a + b;
    }

    int add(int a, int b, int c)
    {
        return a + b + c;
    }
    // Operator Overloading
    Number operator+(Number obj)
    {
        Number temp;
        temp.value = value + obj.value;
        return temp;
    }
    void display()
    {
        cout << value;
    }
};
int main()
{
    Number n1(10), n2(20), n3;
    // Function Overloading
    cout << "FUNCTION OVERLOADING" << endl;
    cout << "Addition of two numbers: "
         << n1.add(10, 20) << endl;
    cout << "Addition of three numbers: "
         << n1.add(10, 20, 30) << endl;
    // Operator Overloading
    cout << "\nOPERATOR OVERLOADING" << endl;
    n3 = n1 + n2;
    cout << "Value of first object: ";
    n1.display();
    cout << "\nValue of second object: ";
    n2.display();
    cout << "\nResult after using overloaded + operator: ";
    n3.display();
    cout << endl;
    return 0;
}