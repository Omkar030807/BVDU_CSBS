#include<iostream>
using namespace std;
class A{
public: int a,b,c;
public: string des;
};
class B : public  A{
    public: void getdata(){
        cout<<"Enter Your Data\n";
        cout<<"Enter Your Poly Marks :- ";
        cin>>a;
        cout<<"Enter Your 10th Marks :- ";
        cin>>b;
        cout<<"Enter Your Current Sem marks :- ";
        cin>>c;
        cout<<"Enter Your Designation :- ";
        cin>>des;
    }
    public: void showdata(){
        cout<<"Your Poly Marks :- "<<a;
        cout<<"\nYour 10th Marks :- "<<b;
        cout<<"\nYour Current Sem marks"<<c;
        cout<<"\nEnter Your Designation :- "<<des;
    }
};
int main(){
    B obj;
    obj.getdata();
    obj.showdata();
    return 0;
}