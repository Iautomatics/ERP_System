from rest_framework import serializers
from .models import AuditoriaAcceso, ConfiguracionSeguridad

class AuditoriaAccesoSerializer(serializers.ModelSerializer):
    usuario_nombre = serializers.CharField(source='usuario.username', read_only=True)
    class Meta:
        model = AuditoriaAcceso
        fields = '__all__'

class ConfiguracionSeguridadSerializer(serializers.ModelSerializer):
    class Meta:
        model = ConfiguracionSeguridad
        fields = '__all__'
