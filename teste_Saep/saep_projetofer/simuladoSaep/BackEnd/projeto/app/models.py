from django.db import models

class Usuario (models.Model):
    nome = models.CharField(max_length=100)
    email = models.CharField(max_length=100)

    def __str__(self):
        return self.nome
    
class Tarefa (models.Model):
    nome = models.CharField(max_length=100)
    descricao = models.CharField(max_length=255)
    nomeSetor = models.CharField(max_length=100)
    dataCadastro = models.DateField(auto_now_add=True)
    PRIORIDADE_CHOICES = [
        ('B', 'Baixa'),
        ('M', 'Media'),
        ('A', 'Alta'),
    ]

    STATUS_CHOICES = [
        ('A', 'A fazer'),
        ('F', 'Fazendo'),
        ('P', 'Pronto'),
    ]
    prioridade = models.CharField(max_length=1, choices=PRIORIDADE_CHOICES, default='B')
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='A' )
    usuario =  models.ForeignKey(Usuario, on_delete=models.CASCADE)
    