#include <iostream>
using namespace std;
int main()
{
    char str[100];
    int length = 0;
    int flag = 1;
    cout << "Enter string: ";
    cin.getline(str, 100);
    while(str[length] != '\0')
        length++;
    int first = 0;
    int last = length - 1;
    while(first < last)
    {
        if(str[first] != str[last])
        {
            flag = 0;
            break;
        }
        first++;
        last--;
    }
    if(flag == 1)
        cout << "Palindrome";
    else
        cout << "Not Palindrome";
    return 0;
}