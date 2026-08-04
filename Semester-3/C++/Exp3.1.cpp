//Program For Sorting of Array
#include <iostream>
using namespace std;

int main() {
    int a[100], n, i, j, temp;

    cout << "Enter number of elements: ";
    cin >> n;

    cout << "Enter " << n << " elements:" << endl;
    for (i = 0; i < n; i++) {
        cin >> a[i];
    }

    cout << "Original array: ";
    for (i = 0; i < n; i++) {
        cout << a[i] << " ";
    }

    for (i = 0; i < n - 1; i++) {
        for (j = i + 1; j < n; j++) {
            if (a[i] > a[j]) {
                temp = a[i];
                a[i] = a[j];
                a[j] = temp;
            }
        }
    }

    cout << "\nSorted array: ";
    for (i = 0; i < n; i++) {
        cout << a[i] << " ";
    }

    return 0;
}