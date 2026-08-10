#include <iostream>
using namespace std;
bool isPrime(int n)
{
    if(n < 2)
        return false;
    for(int i = 2; i < n; i++)
    {
        if(n % i == 0)
            return false;
    }
    return true;
}
int main()
{
    int n;
    cout << "Enter Number : ";
    cin >> n;
    cout << "Prime Numbers are : ";
    for(int i = 1; i <= n; i++)
    {
        if(isPrime(i))
            cout << i << " ";
    }
    return 0;
}