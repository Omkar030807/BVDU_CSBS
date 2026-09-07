import matplotlib.pyplot as plt
import numpy as np

# 1. Basic Line Plot
x = [1, 2, 3, 4, 5]
y = [2, 3, 5, 7, 11]
plt.plot(x, y)
plt.title('Basic Line Plot')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.show()

# 2. Scatter Plot
plt.scatter(x, y)
plt.title('Scatter Plot')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.show()

# 3. Bar Plot
categories = ['A', 'B', 'C']
values = [10, 20, 15]
plt.bar(categories, values)
plt.title('Bar Plot')
plt.xlabel('Categories')
plt.ylabel('Values')
plt.show()

# 4. Histogram
data = np.random.randn(1000)
plt.hist(data, bins=30)
plt.title('Histogram')
plt.xlabel('Value')
plt.ylabel('Frequency')
plt.show()

# 5. Subplots
y1 = [1, 4, 9, 16, 25]
y2 = [1, 2, 3, 4, 5]
fig, axs = plt.subplots(2)
axs[0].plot(x, y1)
axs[0].set_title('Square Numbers')
axs[1].plot(x, y2, 'r--')
axs[1].set_title('Linear Numbers')
plt.tight_layout()
plt.show()

# 6. Simple Plot (Line Plot with Formatting)
plt.plot(
    x,
    y,
    label='Prime Numbers',
    color='blue',
    linestyle='-',
    linewidth=2,
    marker='o',
    markersize=5,
    markerfacecolor='red'
)
plt.title('Basic Line Plot')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.legend()
plt.grid(True)
plt.show()

# 7. Scatter Plot with Formatting
sizes = [20, 50, 80, 200, 500]
colors = [0, 1, 2, 3, 4]
plt.scatter(
    x,
    y,
    s=sizes,
    c=colors,
    cmap='viridis',
    alpha=0.8,
    edgecolor='black'
)
plt.title('Scatter Plot')
plt.xlabel('X-axis')
plt.ylabel('Y-axis')
plt.colorbar(label='Color Scale')
plt.show()