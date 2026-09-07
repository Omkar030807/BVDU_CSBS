import matplotlib.pyplot as plt
import numpy as np
data = [1, 2, 3, 4, 5]
# Calculate mean, variance, and standard deviation
mean = np.mean(data)
variance = np.var(data)
std_dev = np.std(data)
# Create histogram
plt.hist(
    data,
    bins=5,
    alpha=0.5,
    color='b',
    edgecolor='black'
)
# Plot mean
plt.axvline(
    mean,
    color='r',
    linestyle='dashed',
    linewidth=2,
    label=f'Mean: {mean}'
)
# Plot standard deviation
plt.axvline(
    mean + std_dev,
    color='g',
    linestyle='dotted',
    linewidth=2,
    label=f'Standard Deviation: {std_dev:.2f}'
)
plt.axvline(
    mean - std_dev,
    color='g',
    linestyle='dotted',
    linewidth=2
)
plt.legend()
plt.title('Variance and Standard Deviation')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.show()