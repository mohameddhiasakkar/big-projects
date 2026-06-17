from PyPDF2 import PdfReader
from .skills import SKILLS

def extract_text(pdf_file):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text.lower()

def detect_skills(text):
    found = []
    for skill in SKILLS:
        if skill.lower() in text:  # Case-insensitive matching
            found.append(skill)
    return found

def calculate_score(found_skills, required_skills):
    if len(required_skills) == 0:
        return 0
    score = (len(found_skills) / len(required_skills)) * 100
    return round(score, 2)