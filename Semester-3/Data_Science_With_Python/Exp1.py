#Experiment 1                                       
#Arithmetic Operations
#Addition
a = 5   
b = 3 
result = a + b 
print("Addition :- " , result) 
#Subtraction
a = 5   
b = 3 
result = a - b 
print("Subtraction :- " , result)
#multiplication
a = 5 
b = 3 
result = a * b 
print("Multiplication" , result) 
#Division
a = 5 
b = 3 
result = a / b 
print("Division :- " , result)
#Floor Division
a = 5 
b = 3 
result = a // b 
print("Floor Division :- " , result)
#Modulus
a = 5 
b = 3 
result = a % b
print("Modulus :- " , result)
#Exponention
a = 5 
b = 3 
result = a ** b 
print("Exponention :- " , result)


#Conditional Statements 
#if Statement
a = 10 
if a > 5: 
    print("a is greater than 5") 
#if-else statement
a = 3 
if a > 5: 
    print("a is greater than 5") 
else: 
    print("a is not greater than 5")
#if-elif-else Statement
a = 10 
if a < 5: 
    print("a is less than 5") 
elif a == 10: 
    print("a is 10")  # Output: a is 10 
else: 
    print("a is greater than 5 and not equal to 10")
#Nested if Statement
a = 10 
b = 20 
if a > 5: 
    if b > 15: 
        print("a is greater than 5 and b is greater than 15")

#Looping Statements 
count =1
#for Loop
fruits = ["apple", "banana", "cherry"] 
for fruit in fruits: 
    print(fruit)
#While Loop
while count <= 3: 
    print(count) 
    count += 1
#Nested Loops
for i in range(1, 4): 
    for j in range(1, 3): 
        print(f"i={i}, j={j}") 
#Loop Control Statement
for i in range(1, 6): 
    if i == 4: 
        break 
    print(i) 