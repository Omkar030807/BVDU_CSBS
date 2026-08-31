import pandas as pd
data = {
    'Department': ['CS', 'IT', 'CS', 'IT', 'CS', 'IT'],
    'Marks': [80, 70, 90, 60, 85, 75]
}
df = pd.DataFrame(data)
grouped = df.groupby('Department')['Marks']
print("Sum:")
print(grouped.sum())
print("\nMean:")
print(grouped.mean())
print("\nCount:")
print(grouped.count())
print("\nMi nimum:")
print(grouped.min())
print("\nMaximum:")
print(grouped.max())