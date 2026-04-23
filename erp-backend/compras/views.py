from rest_framework import viewsets, status
from rest_framework.response import Response
from usuarios.permisos import PermisoCompras
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra
from .serializers import ProveedorSerializer, OrdenCompraSerializer, OrdenCompraCreateSerializer, DetalleOrdenCompraSerializer

class ProveedorViewSet(viewsets.ModelViewSet):
    queryset = Proveedor.objects.filter(activo=True)
    serializer_class = ProveedorSerializer
    permission_classes = [PermisoCompras]

class OrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = OrdenCompra.objects.select_related('proveedor').prefetch_related('detalles').all()
    permission_classes = [PermisoCompras]

    def get_serializer_class(self):
        if self.action == 'create':
            return OrdenCompraCreateSerializer
        return OrdenCompraSerializer

    def create(self, request, *args, **kwargs):
        serializer = OrdenCompraCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        orden = serializer.save()
        return Response(OrdenCompraSerializer(orden).data, status=status.HTTP_201_CREATED)

class DetalleOrdenCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleOrdenCompra.objects.all()
    serializer_class = DetalleOrdenCompraSerializer
    permission_classes = [PermisoCompras]
