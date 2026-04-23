from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Perfil

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perfil
        fields = '__all__'

class UsuarioSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(source='perfil.rol', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined', 'rol']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    rol = serializers.CharField(write_only=True, required=False, default='solo_lectura')

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'is_staff', 'rol']

    def create(self, validated_data):
        rol = validated_data.pop('rol', 'solo_lectura')
        password = validated_data.pop('password')
        user = User.objects.create_user(password=password, **validated_data)
        Perfil.objects.create(usuario=user, rol=rol)
        return user
