from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from usuarios.permisos import PermisoVentas
from .models import Cliente, Venta, DetalleVenta
from .serializers import ClienteSerializer, VentaSerializer, VentaCreateSerializer, DetalleVentaSerializer

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.filter(activo=True)
    serializer_class = ClienteSerializer
    permission_classes = [PermisoVentas]

class VentaViewSet(viewsets.ModelViewSet):
    queryset = Venta.objects.select_related('cliente').prefetch_related('detalles').all()
    permission_classes = [PermisoVentas]

    def get_serializer_class(self):
        if self.action == 'create':
            return VentaCreateSerializer
        return VentaSerializer

    def create(self, request, *args, **kwargs):
        serializer = VentaCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        venta = serializer.save()
        return Response(VentaSerializer(venta).data, status=status.HTTP_201_CREATED)

class DetalleVentaViewSet(viewsets.ModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer
    permission_classes = [PermisoVentas]
