import pandas as pd
# Dataset 1
students = pd.DataFrame({
    'ID': [1, 2, 3],
    'Name': ['Amit', 'Rahul', 'Sneha'],
    'Marks': [80, 70, 90]
})
# Dataset 2
details = pd.DataFrame({
    'ID': [1, 2, 3],
    'Branch': ['CS', 'IT', 'CS'],
    'City': ['Pune', 'Mumbai', 'Pune']
})
print("Dataset 1:")
print(students)
print("\nDataset 2:")
print(details)
# Merge
merged = pd.merge(students, details, on='ID')
print("\nMerged Dataset:")
print(merged)
# Concatenate
concat_data = pd.concat([students, students])
print("\nConcatenated Dataset:")
print(concat_data)
# Join using index
students_index = students.set_index('ID')
details_index = details.set_index('ID')
joined = students_index.join(details_index[['Branch', 'City']])
print("\nJoined Dataset:")
print(joined)
# Pivot table
pivot = merged.pivot_table(
    index='Branch',
    values='Marks',
    aggfunc='mean'
)
print("\nPivot Table:")
print(pivot)