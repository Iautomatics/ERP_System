from rest_framework import serializers
from .models import Almacen, Stock, MovimientoInventario

class AlmacenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Almacen
        fields = '__all__'

class StockSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    almacen_nombre = serializers.CharField(source='almacen.nombre', read_only=True)
    class Meta:
        model = Stock
        fields = '__all__'

class MovimientoInventarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimientoInventario
        fields = '__all__'
