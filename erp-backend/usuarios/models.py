from django.db import models
from django.contrib.auth.models import User

class Perfil(models.Model):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('contador', 'Contador'),
        ('vendedor', 'Vendedor'),
        ('comprador', 'Comprador'),
        ('almacenero', 'Almacenero'),
        ('solo_lectura', 'Solo Lectura'),
    ]
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='solo_lectura')
    telefono = models.CharField(max_length=20, blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.usuario.username} - {self.get_rol_display()}"
