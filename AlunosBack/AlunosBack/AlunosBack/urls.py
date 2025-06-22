from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from aluno.views import AlunoViewSet

router = DefaultRouter()
router.register('alunos', AlunoViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls))
]