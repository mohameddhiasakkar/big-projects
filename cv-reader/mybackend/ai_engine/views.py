from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from cvapp.models import Resume
from ai_engine.utils import extract_text
from ai_engine.smart_ai import match_skills, SKILLS, calculate_score
from ai_engine.models import Analysis

@api_view(['POST'])
def analyze_resume(request, resume_id):
    try:
        # 1. Get resume
        resume = Resume.objects.get(id=resume_id)
    except Resume.DoesNotExist:
        return Response(
            {"error": f"Resume {resume_id} not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    try:
        # 2. Extract text from PDF
        text = extract_text(resume.file)
        if not text or len(text.strip()) < 50:
            return Response(
                {"error": "Could not extract meaningful text from PDF"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 3. Detect skills (semantic matching)
        found_skills = match_skills(text)
        
        # 4. Calculate missing skills
        all_skills = set(SKILLS.keys())
        missing_skills = list(all_skills - set(found_skills))
        
        # 5. Calculate score
        score = calculate_score(found_skills, all_skills)
        
        # 6. Generate better recommendations
        if missing_skills:
            recommendations = f"Consider learning: {', '.join(missing_skills[:3])}"
        else:
            recommendations = "Great! You have all key skills covered."
        
        # 7. Save analysis (Using update_or_create to handle OneToOneField constraint)
        with transaction.atomic():
            analysis, created = Analysis.objects.update_or_create(
                resume=resume,
                defaults={
                    "score": score,
                    "missing_skills": ", ".join(missing_skills),
                    "recommendations": recommendations
                }
            )
        
        # 8. Return response
        return Response({
            "resume_id": resume.id,
            "score": score,
            "found_skills": found_skills,
            "missing_skills": missing_skills,
            "total_skills": len(all_skills),
            "match_percentage": f"{score}%",
            "recommendations": recommendations,
            "is_new_analysis": created
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        # Consider adding logging here for production debugging
        return Response(
            {"error": f"Analysis failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )