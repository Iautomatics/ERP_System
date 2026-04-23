from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import AuditoriaAcceso, ConfiguracionSeguridad
from .serializers import AuditoriaAccesoSerializer, ConfiguracionSeguridadSerializer

def get_ip(request):
    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0]
    return request.META.get('REMOTE_ADDR')

class LoginAuditView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        exitoso = response.status_code == 200
        from django.contrib.auth.models import User
        usuario = None
        try:
            usuario = User.objects.get(username=request.data.get('username'))
        except User.DoesNotExist:
            pass
        AuditoriaAcceso.objects.create(
            usuario=usuario,
            accion='Login',
            modulo='Autenticación',
            ip=get_ip(request),
            exitoso=exitoso,
            detalle=f"Login {'exitoso' if exitoso else 'fallido'} - usuario: {request.data.get('username')}",
        )
        return response

class AuditoriaAccesoViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditoriaAcceso.objects.select_related('usuario').all()
    serializer_class = AuditoriaAccesoSerializer
    permission_classes = [IsAdminUser]

class ConfiguracionSeguridadViewSet(viewsets.ModelViewSet):
    queryset = ConfiguracionSeguridad.objects.all()
    serializer_class = ConfiguracionSeguridadSerializer
    permission_classes = [IsAdminUser]
