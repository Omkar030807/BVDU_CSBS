#Experiment 4                                                 
# Read Mode (r)
with open("hello.txt", "r") as file:
    content = file.read()
    print(content)

# Write Mode (w)
with open("hello.txt", "w") as file:
    file.write("Welcome to Python File Handling.")

# Append Mode (a)
with open("hello.txt", "a") as file:
    file.write("\nThis line is added using Append Mode.")

# Read and Write Mode (r+)
with open("hello.txt", "r+") as file:
    content = file.read()
    print(content)
    file.write("\nThis content is added using Read and Write Mode.")

# Write and Read Mode (w+)
with open("hello.txt", "w+") as file:
    file.write("Python makes file handling easy.")
    file.seek(0)
    content = file.read()
    print(content)

# Append and Read Mode (a+)
with open("hello.txt", "a+") as file:
    file.write("\nLearning Python is fun.")
    file.seek(0)
    content = file.read()
    print(content)

# Binary Mode (rb)
with open("hello.txt", "rb") as file:
    content = file.read()
    print(content)

# Text Mode (rt)
with open("hello.txt", "rt") as file:
    content = file.read()
    print(content)