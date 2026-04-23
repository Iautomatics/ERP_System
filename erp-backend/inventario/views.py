from rest_framework import viewsets
from usuarios.permisos import PermisoInventario
from .models import Almacen, Stock, MovimientoInventario
from .serializers import AlmacenSerializer, StockSerializer, MovimientoInventarioSerializer

class AlmacenViewSet(viewsets.ModelViewSet):
    queryset = Almacen.objects.all()
    serializer_class = AlmacenSerializer
    permission_classes = [PermisoInventario]

class StockViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Stock.objects.select_related('producto', 'almacen').all()
    serializer_class = StockSerializer
    permission_classes = [PermisoInventario]

class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [PermisoInventario]
