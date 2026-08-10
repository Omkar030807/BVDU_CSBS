#include <iostream>
using namespace std;
int main()
{
    int n, i;
    int arr[100];
    cout << "Enter number of elements: ";
    cin >> n;
    cout << "Enter elements: ";
    for(i = 0; i < n; i++)
    {
        cin >> arr[i];
    }
    int largest = arr[0];
    int smallest = arr[0];
    for(i = 1; i < n; i++)
    {
        if(arr[i] > largest)
            largest = arr[i];

        if(arr[i] < smallest)
            smallest = arr[i];
    }
    cout << "Largest = " << largest << endl;
    cout << "Smallest = " << smallest << endl;
    return 0;
}