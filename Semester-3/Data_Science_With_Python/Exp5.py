import pandas as pd

# Create DataFrame
data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['New York', 'Los Angeles', 'Chicago']
}

df = pd.DataFrame(data)
print(df)

# Reading from CSV File
df = pd.read_csv('data.csv')
print(df.head())

# Data Cleaning
df.fillna(0, inplace=True)
df.dropna(inplace=True)

# Grouping and Aggregation
grouped = df.groupby('City')['Age'].mean()
print(grouped)

# Plotting
df['Age'].plot(kind='hist')

import matplotlib.pyplot as plt
plt.show()