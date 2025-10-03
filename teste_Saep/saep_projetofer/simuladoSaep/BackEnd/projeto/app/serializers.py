from rest_framework import serializers
from .models import Usuario , Tarefa

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario 
        fields = '__all__'

class TarefaSerializer(serializers.ModelSerializer):
    status_display = serializers.SerializerMethodField()
    usuario_nome = serializers.CharField(source='usuario.nome', read_only=True)

    class Meta:
        model = Tarefa
        fields = [
            'id', 'nome', 'descricao', 'nomeSetor', 'dataCadastro',
            'prioridade', 'status', 'usuario', 'status_display', 'usuario_nome'
        ]

    def get_status_display(self, obj):
        return obj.get_status_display()