from django.shortcuts import render
from rest_framework.generics import ListCreateAPIView , RetrieveUpdateDestroyAPIView, ListAPIView
from .models import Usuario , Tarefa
from .serializers import UsuarioSerializer, TarefaSerializer
from django.http import Http404
from rest_framework.response import Response
from rest_framework.exceptions import NotFound
from rest_framework import status

#Criar e listar usuario
class UsuarioListCreate(ListCreateAPIView):
    queryset = Usuario.objects.all() 
    serializer_class = UsuarioSerializer

    def perform_create(self, serializer):
        serializer.save()

#Deletar, visualizar, atualizar usuario

class UsuarioRetrieveUpdateDestroy(RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise NotFound(detail="Esse usuario foi não encontrada.")
    
    # mesnsagem de erro quando o usuario é excluida com sucesso
    def destroy(self, request, *args, **kwargs):
        super().destroy(request, *args, **kwargs)
        return Response({"O usuario foi excluído"})
    
# Criar e listar Tarefa

class TarefaListCreate (ListCreateAPIView):
    queryset = Tarefa.objects.all()
    serializer_class = TarefaSerializer

    def perform_create(self, serializer):
        serializer.save()


#Deletar, visualizar, atualizar tarefas
class TarefaRetrieveUpdateDestroy(RetrieveUpdateDestroyAPIView):
    queryset = Tarefa.objects.all()
    serializer_class = TarefaSerializer

    def get_object(self):
        try:
            return super().get_object()
        except Http404:
            raise NotFound(detail="Essa tarefa não foi encontrada.")
    
    def destroy(self, request, *args, **kwargs):
        try:
            tarefa = self.get_object()
            tarefa.delete()
            return Response({"mensagem": "Tarefa excluída com sucesso"}, status=status.HTTP_200_OK)
        except Http404:
            raise NotFound("Essa tarefa não foi encontrada.")
        except Exception as e:
            return Response({"erro": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)