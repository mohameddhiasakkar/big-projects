from rest_framework.decorators import api_view
from rest_framework.response import Response
from cvapp.models import Resume
@api_view(['POST'])
def upload_cv(request):
    file = request.FILES['file']

    resume = Resume.objects.create(file=file)

    return Response({
        "message": "CV uploaded successfully",
        "resume_id": resume.id
    })