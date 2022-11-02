#include <windows.h>
#include <conio.h>
#include <iostream>
#include <string>
using namespace std;
//VOID WINAPI Sleep(DWORD dwMilliseconds);
string st;
int dl;
string no;
int main()
 
//string yes;


{    
  cout<<"Your cup is empty?[yes/no] ";  
  //getline(cin,st);
  getline(cin,st);
  if(st=="no")
  {
    cout<<"drink your coffe";
  }
  else
  {
    cout<<"preapering your coffe";
    for(int i=5; i>0; i--)
    {
    cout << i <<" ";     
    Sleep(500);
    }
    cout<<"enjoy your coffe"; 
    
  }
 /*else
  {
    dl=st.length();
  for(int i=0;i<dl;i++)
  {
   cout<<st[i];     
   Sleep(500);
  } 
  }
  */
  cout<<endl<<"press any key";
  getch();
}