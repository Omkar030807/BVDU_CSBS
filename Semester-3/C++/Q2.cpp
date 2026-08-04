#include <iostream>
#include <cstring>
using namespace std;
int main() {
    char str[100];
    cout << "Enter a word: ";
    cin >> str;
    int start = 0;
    int end = strlen(str) - 1;
    int isPalindrome = 1;
    while (start < end) {
        if (str[start] != str[end]) {
            isPalindrome = 0;
            break;
        }
        start++;
        end--;
    }
    if (isPalindrome == 1)
        cout << "YES, it is a palindrome!" << endl;
    else
        cout << "NO, it is not a palindrome." << endl;
    return 0;
}