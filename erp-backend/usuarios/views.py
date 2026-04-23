from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from django.contrib.auth.models import User
from .models import Perfil
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, PerfilSerializer

class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-date_joined')
    permission_classes = [IsAdminUser]

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user == request.user:
            return Response({'error': 'No puedes eliminarte a ti mismo'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class PerfilViewSet(viewsets.ModelViewSet):
    queryset = Perfil.objects.select_related('usuario').all()
    serializer_class = PerfilSerializer
    permission_classes = [IsAdminUser]
