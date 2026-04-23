from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum
from usuarios.permisos import PermisoContabilidad
from .models import CuentaContable, AsientoContable, LineaAsiento
from .serializers import CuentaContableSerializer, AsientoContableSerializer, AsientoCreateSerializer
from .utils import crear_cuentas_base

class CuentaContableViewSet(viewsets.ModelViewSet):
    queryset = CuentaContable.objects.filter(activa=True)
    serializer_class = CuentaContableSerializer
    permission_classes = [PermisoContabilidad]

    @action(detail=False, methods=['post'])
    def inicializar(self, request):
        crear_cuentas_base()
        return Response({'mensaje': 'Cuentas base creadas correctamente'})

class AsientoContableViewSet(viewsets.ModelViewSet):
    queryset = AsientoContable.objects.prefetch_related('lineas__cuenta').all().order_by('-creado')
    permission_classes = [PermisoContabilidad]

    def get_serializer_class(self):
        if self.action == 'create':
            return AsientoCreateSerializer
        return AsientoContableSerializer

    def create(self, request, *args, **kwargs):
        serializer = AsientoCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        asiento = serializer.save()
        return Response(AsientoContableSerializer(asiento).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        cuentas = CuentaContable.objects.filter(activa=True)
        resultado = []
        for cuenta in cuentas:
            lineas = LineaAsiento.objects.filter(cuenta=cuenta)
            total_debe = lineas.aggregate(t=Sum('debe'))['t'] or 0
            total_haber = lineas.aggregate(t=Sum('haber'))['t'] or 0
            saldo = total_debe - total_haber
            if total_debe > 0 or total_haber > 0:
                resultado.append({
                    'codigo': cuenta.codigo,
                    'nombre': cuenta.nombre,
                    'tipo': cuenta.tipo,
                    'debe': float(total_debe),
                    'haber': float(total_haber),
                    'saldo': float(saldo),
                })
        return Response(resultado)
