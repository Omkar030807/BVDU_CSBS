#Experiment 2                                                 Omkar Tate 66 CSBS
#List 

# Creating a List
print("List :- ")
my_list = [1, 2, 3, 4, 5]
# Length of List
my_list = [1, 2, 3, 4, 5]
print(len(my_list))
# Insert Element
my_list = [1, 2, 3, 4, 5]
my_list.insert(2, 'a')
print(my_list)
# Append Element
my_list = [1, 2, 3, 4, 5]
my_list.append(6)
print(my_list)
# Delete Element
my_list = [1, 2, 3, 4, 5]
del my_list[2]
print(my_list)

#Tuple
print("Tuple :- ")
# Creating Tuple
my_tuple = (1, 2, 3, 4, 5)
# Length of Tuple
my_tuple = (1, 2, 3, 4, 5)
print(len(my_tuple))
# Copy Tuple
my_tuple = (1, 2, 3, 4, 5)
copy_tuple = tuple(my_tuple)
print(copy_tuple)
# Join Tuple
my_tuple = ('a', 'b', 'c')
joined = ', '.join(my_tuple)
print(joined)

#Dictionary
print("Dictionary :- ")
# Creating Dictionary
my_dict = {'name': 'Alice', 'age': 30, 'city': 'New York'}
# Length of Dictionary
print(len(my_dict))
# Dictionary Keys
print(my_dict.keys())
# Dictionary Values
print(my_dict.values())
# Update Dictionary
my_dict.update({'city': 'Pune'})
print(my_dict)

#Set
print("Set :- ")
# Creating Set
my_set = {1, 2, 3, 4, 5}
# Length of Set
print(len(my_set))
# Update Set
my_set.update([6, 7])
print(my_set)
# Remove Element
my_set.remove(3)
print(my_set)
# Clear Set
my_set.clear()
print(my_set)