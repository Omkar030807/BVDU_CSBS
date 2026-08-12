import pdfplumber
import docx
import spacy
import re

nlp = spacy.load("en_core_web_sm")

def extract_text(file):
    if file.name.endswith('.pdf'):
        with pdfplumber.open(file) as pdf:
            return " ".join([page.extract_text() for page in pdf.pages])
    elif file.name.endswith('.docx'):
        doc = docx.Document(file)
        return " ".join([para.text for para in doc.paragraphs])
    return ""

def extract_skills(text):
    # Common skills database (you can expand this)
    skills_db = [
        'python', 'java', 'javascript', 'react', 'node', 'sql', 
        'mongodb', 'aws', 'docker', 'git', 'machine learning',
        'data analysis', 'flask', 'django', 'html', 'css', 'tensorflow'
    ]
    text_lower = text.lower()
    found = [skill for skill in skills_db if skill in text_lower]
    return list(set(found))

def extract_email(text):
    return re.findall(r'[\w\.-]+@[\w\.-]+', text)

def extract_phone(text):
    return re.findall(r'\b\d{10}\b', text)
