#include<iostream>
using namespace std;
class Employee{
public: int emp_id,salary;
public: char designation;
public: void getdata(){
    cout<<"Enter Employee Details :- \n";
    cout<<"Enter Employee ID :- ";
    cin>>emp_id;
    cout<<"Enter Employee Salary :- ";
    cin>>salary;
    cout<<"Enter Employee Designation :- ";
    cin>>designation;
}
public: void showdata(){
    cout<<"\nEmployee ID :- " <<emp_id;
    cout<<"\nEmployee Salary :- "<<salary;
    cout<<"\nEmployee Designation :- "<<designation;
}
};
int main(){
    Employee obj;
    obj.getdata();
    obj.showdata();
}