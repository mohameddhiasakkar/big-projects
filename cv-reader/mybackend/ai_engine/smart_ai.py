from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from .ai_model import model

SKILLS = {
    "python": "Python programming language",
    "django": "Django web framework",
    "flask": "Flask web framework",
    "sql": "database and SQL queries",
    "machine learning": "machine learning algorithms",
    "docker": "containerization tool",
    "aws": "cloud computing platform",
    "git": "version control system"
}

skill_names = list(SKILLS.keys())
skill_texts = list(SKILLS.values())

# Pre-compute embeddings once at startup
skill_embeddings = model.encode(skill_texts)

def match_skills(cv_text, threshold=0.45):
    """Match CV text against skill embeddings using semantic similarity."""
    cv_embedding = model.encode([cv_text])
    similarities = cosine_similarity(cv_embedding, skill_embeddings)[0]
    
    found = [skill_names[i] for i, score in enumerate(similarities) 
             if score > threshold]
    
    return found

def calculate_score(found_skills, all_skills):
    """Calculate match percentage."""
    if len(all_skills) == 0:
        return 0
    return round((len(found_skills) / len(all_skills)) * 100, 2)