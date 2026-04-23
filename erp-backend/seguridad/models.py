from django.db import models
from django.contrib.auth.models import User

class AuditoriaAcceso(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    accion = models.CharField(max_length=200)
    modulo = models.CharField(max_length=100)
    ip = models.GenericIPAddressField(null=True, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    exitoso = models.BooleanField(default=True)
    detalle = models.TextField(blank=True)

    class Meta:
        verbose_name = "Auditoría de Acceso"
        verbose_name_plural = "Auditoría de Accesos"
        ordering = ['-fecha']

    def __str__(self):
        return f"{self.usuario} - {self.accion} ({self.fecha})"

class ConfiguracionSeguridad(models.Model):
    intentos_maximos = models.IntegerField(default=5)
    tiempo_bloqueo_minutos = models.IntegerField(default=30)
    sesion_expira_minutos = models.IntegerField(default=480)
    requiere_2fa = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Configuración de Seguridad"
        verbose_name_plural = "Configuración de Seguridad"

    def __str__(self):
        return "Configuración de Seguridad"
