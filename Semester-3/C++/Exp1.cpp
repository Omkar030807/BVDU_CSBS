// Program 2: Swap two numbers without using a third variable
#include <stdio.h>
int main()
{
    int a, b;
    printf("Enter first number: ");
    scanf("%d", &a);
    printf("Enter second number: ");
    scanf("%d", &b);
    a = a + b;
    b = a - b;
    a = a - b;
    printf("After Swapping:\n");
    printf("First Number = %d\n", a);
    printf("Second Number = %d\n", b);
    printf("\nPress Enter to exit...");
getchar();
getchar();
    return 0;
}