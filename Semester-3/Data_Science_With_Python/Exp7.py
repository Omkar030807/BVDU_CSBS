import matplotlib.pyplot as plt

data = [1, 2, 2, 3, 4, 7, 9]

# Calculate mean, median, and mode
mean = sum(data) / len(data)
median = sorted(data)[len(data) // 2]
mode = max(set(data), key=data.count)

# Create histogram
plt.hist(
    data,
    bins=range(1, 11),
    alpha=0.5,
    color='g',
    edgecolor='black'
)

# Plot mean, median, and mode
plt.axvline(
    mean,
    color='r',
    linestyle='dashed',
    linewidth=2,
    label=f'Mean: {mean}'
)

plt.axvline(
    median,
    color='b',
    linestyle='dotted',
    linewidth=2,
    label=f'Median: {median}'
)

plt.axvline(
    mode,
    color='y',
    linestyle='solid',
    linewidth=2,
    label=f'Mode: {mode}'
)

plt.legend()

plt.title('Central Tendency Measures')
plt.xlabel('Value')
plt.ylabel('Frequency')

plt.show()