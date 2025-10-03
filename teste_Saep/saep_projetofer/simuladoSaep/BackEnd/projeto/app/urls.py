from django.urls import path
from .views import UsuarioListCreate, UsuarioRetrieveUpdateDestroy, TarefaRetrieveUpdateDestroy,TarefaListCreate

# Usuario 
urlpatterns = [
    path('usuario/', UsuarioListCreate.as_view()),
    path('usuario/<int:pk>/', UsuarioRetrieveUpdateDestroy.as_view()),

    #tarefa
    path('tarefa/', TarefaListCreate.as_view()),
    path('tarefa/<int:pk>/', TarefaRetrieveUpdateDestroy.as_view()),

]