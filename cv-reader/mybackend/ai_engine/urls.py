from django.urls import path
from .views import analyze_resume

urlpatterns = [
    path('analyze/<int:resume_id>/', analyze_resume),
]