from django.db import models
from cvapp.models import Resume

class Analysis(models.Model):
    resume = models.OneToOneField(Resume, on_delete=models.CASCADE)
    score = models.FloatField(default=0)
    missing_skills = models.TextField()
    recommendations = models.TextField()

    def __str__(self):
        return f"Analysis {self.id}"