#include <iostream>
#include <fstream>
#include <iomanip>
#include <string>
using namespace std;
int main()
{
    string name;
    int rollNo;
    float marks;
    // Formatted input from keyboard
    cout << "Enter Roll Number: ";
    cin >> rollNo;
    cout << "Enter Student Name: ";
    cin.ignore();
    getline(cin, name);
    cout << "Enter Marks: ";
    cin >> marks;
    // Create and write into the file
    ofstream outFile("student.txt");
    if (!outFile)
    {
        cout << "Error: File could not be created." << endl;
        return 1;
    }
    outFile << "Student Record" << endl;
    outFile << "----------------------" << endl;
    outFile << "Roll Number : " << rollNo << endl;
    outFile << "Name        : " << name << endl;
    outFile << "Marks       : " << fixed << setprecision(2)
            << marks << endl;
    outFile.close();
    cout << "\nFile created and data written successfully." << endl;
    // Read the file
    ifstream inFile("student.txt");
    if (!inFile)
    {
        cout << "Error: File could not be opened for reading." << endl;
        return 1;
    }
    cout << "\nData read from file:" << endl;
    cout << "----------------------" << endl;
    string line;
    while (getline(inFile, line))
    {
        cout << line << endl;
    }
    inFile.close();
    // Append additional data
    ofstream appendFile("student.txt", ios::app);
    if (!appendFile)
    {
        cout << "Error: File could not be opened for appending." << endl;
        return 1;
    }
    appendFile << "Status      : File Handling Completed" << endl;
    appendFile.close();
    cout << "\nData appended successfully." << endl;
    // Read the updated file
    inFile.open("student.txt");
    cout << "\nUpdated file contents:" << endl;
    cout << "----------------------" << endl;
    while (getline(inFile, line))
    {
        cout << line << endl;
    }
    inFile.close();
    return 0;
}