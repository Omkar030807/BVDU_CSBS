#Experiment 3                                                 

# Function to Add Two Numbers
def add(x, y):
    return x + y


# Function to Subtract Two Numbers
def subtract(x, y):
    return x - y


# Function to Multiply Two Numbers
def multiply(x, y):
    return x * y


# Function to Divide Two Numbers
def divide(x, y):
    return x / y


# Calculator Function
def calculator():

    print("Select Operation:")
    print("1. Add")
    print("2. Subtract")
    print("3. Multiply")
    print("4. Divide")

    choice = input("Enter Choice (1/2/3/4): ")

    num1 = float(input("Enter First Number: "))
    num2 = float(input("Enter Second Number: "))

    if choice == '1':
        print(f"{num1} + {num2} = {add(num1, num2)}")

    elif choice == '2':
        print(f"{num1} - {num2} = {subtract(num1, num2)}")

    elif choice == '3':
        print(f"{num1} * {num2} = {multiply(num1, num2)}")

    elif choice == '4':
        if num2 == 0:
            print("Error: Division by Zero!")
        else:
            print(f"{num1} / {num2} = {divide(num1, num2)}")

    else:
        print("Invalid Choice")


# Main Program
while True:

    calculator()

    repeat = input("Do you want to perform another calculation? (y/n): ")

    if repeat.lower() != "y":
        break

print("Calculator Program Ended.")