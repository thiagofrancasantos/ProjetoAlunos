from django.db import models

class Aluno(models.Model):
    id_aluno = models.AutoField(primary_key=True)
    nome = models.CharField(max_length=100)
    email = models.CharField(max_length=100)
    telefone = models.CharField(max_length=15)
    id_curso = models.IntegerField()  # Por enquanto só um número, depois você integra

    def __str__(self):
        return self.nome
