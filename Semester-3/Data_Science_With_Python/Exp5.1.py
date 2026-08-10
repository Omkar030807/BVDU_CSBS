# NumPy
import numpy as np

# Create a 1D array
arr1 = np.array([1, 2, 3, 4, 5])
print(arr1)

# Create a 2D array
arr2 = np.array([[1, 2, 3], [4, 5, 6]])
print(arr2)

# Array Operations
arr3 = arr1 + 10
print(arr3)

arr4 = arr1 * 2
print(arr4)

# Statistical Functions
mean_val = np.mean(arr1)
print(mean_val)

std_val = np.std(arr1)
print(std_val)

# Linear Algebra
matrix1 = np.array([[1, 2], [3, 4]])
matrix2 = np.array([[5, 6], [7, 8]])

result = np.dot(matrix1, matrix2)
print(result)