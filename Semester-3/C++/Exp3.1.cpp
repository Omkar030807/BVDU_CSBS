#include <iostream>
using namespace std;
int main()
{
    int arr[5], key;
    int *ptr = arr;
    cout << "Enter 5 elements: ";
    for(int i = 0; i < 5; i++)
        cin >> *(ptr + i);
    cout << "Enter element to search: ";
    cin >> key;
    int found = 0;
    for(int i = 0; i < 5; i++)
    {
        if(*(ptr + i) == key)
        {
            cout << "Element found at position " << i + 1 << endl;
            found = 1;
            break;
        }
    }
    if(found == 0)
        cout << "Element not found" << endl;
    for(int i = 0; i < 4; i++)
    {
        for(int j = i + 1; j < 5; j++)
        {
            if(*(ptr + i) > *(ptr + j))
            {
                int temp = *(ptr + i);
                *(ptr + i) = *(ptr + j);
                *(ptr + j) = temp;
            }
        }
    }
    cout << "Sorted array: ";
    for(int i = 0; i < 5; i++)
        cout << *(ptr + i) << " ";
    return 0;
}