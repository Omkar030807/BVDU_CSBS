//Program For Swapping Numbers
#include <iostream>
using namespace std;
void swapNumbers(int &a ,int &b){
    int temp;
    temp=a;
    a=b;
    b=temp;
}
int main(){
    int x,y;
    cout<<"Enter Two Numbers :- \n";
    cin>>x>>y;
    cout<<"Numbers Before Swapping :-";
    cout<<"\nX = "<<x;
    cout<<"\nY = "<<y;
    swapNumbers(x,y);
    cout<<"\nNumbers After Swapping :- ";
    cout<<"\n X = "<<x;
    cout<<"\n Y = "<<y;
}
