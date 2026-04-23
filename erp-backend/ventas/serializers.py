from rest_framework import serializers
from .models import Cliente, Venta, DetalleVenta

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'

class DetalleVentaSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = DetalleVenta
        fields = '__all__'
        read_only_fields = ['venta', 'subtotal']

class DetalleVentaCreateSerializer(serializers.Serializer):
    producto = serializers.IntegerField()
    cantidad = serializers.DecimalField(max_digits=12, decimal_places=2)
    precio_unitario = serializers.DecimalField(max_digits=12, decimal_places=2)
    descuento = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)

class VentaSerializer(serializers.ModelSerializer):
    detalles = DetalleVentaSerializer(many=True, read_only=True)
    cliente_nombre = serializers.CharField(source='cliente.nombre', read_only=True)
    class Meta:
        model = Venta
        fields = '__all__'

class VentaCreateSerializer(serializers.Serializer):
    cliente = serializers.IntegerField()
    estado = serializers.CharField(default='borrador')
    notas = serializers.CharField(allow_blank=True, default='')
    detalles = DetalleVentaCreateSerializer(many=True)

    def create(self, validated_data):
        from productos.models import Producto
        from inventario.models import Stock, MovimientoInventario, Almacen

        detalles_data = validated_data.pop('detalles')
        ultimo = Venta.objects.order_by('-id').first()
        numero = f"VTA-{(ultimo.id + 1 if ultimo else 1):04d}"

        venta = Venta.objects.create(
            numero=numero,
            cliente_id=validated_data['cliente'],
            estado=validated_data.get('estado', 'borrador'),
            notas=validated_data.get('notas', ''),
        )

        subtotal = 0
        for d in detalles_data:
            producto = Producto.objects.get(id=d['producto'])
            sub = d['cantidad'] * d['precio_unitario'] * (1 - d['descuento'] / 100)
            DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=d['cantidad'],
                precio_unitario=d['precio_unitario'],
                descuento=d['descuento'],
                subtotal=sub,
            )
            subtotal += sub

            # Descontar del inventario
            almacen = Almacen.objects.filter(activo=True).first()
            if almacen:
                MovimientoInventario.objects.create(
                    producto=producto,
                    almacen=almacen,
                    tipo='salida',
                    cantidad=d['cantidad'],
                    referencia=numero,
                    notas=f'Venta {numero}',
                )

        venta.subtotal = subtotal
        venta.total = subtotal
        venta.save()

        from contabilidad.utils import asiento_por_venta
        asiento_por_venta(venta)

        return venta
