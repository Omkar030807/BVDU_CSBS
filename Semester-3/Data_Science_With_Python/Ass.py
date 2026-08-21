class Student:
    def __init__(self, name, m1, m2, m3):
        self.name = name
        self.m1 = m1
        self.m2 = m2
        self.m3 = m3
    def total_marks(self):
        return self.m1 + self.m2 + self.m3
    def percentage(self):
        return self.total_marks() / 3
    def grade(self):
        p = self.percentage()
        if p >= 75:
            return "A"
        elif p >= 60:
            return "B"
        elif p >= 50:
            return "C"
        elif p >= 40:
            return "D"
        else:
            return "F"
s = Student("Omkar", 80, 70, 90)
print("Name:", s.name)
print("Total Marks:", s.total_marks())
print("Percentage:", s.percentage())
print("Grade:", s.grade())