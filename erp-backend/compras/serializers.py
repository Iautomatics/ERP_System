from rest_framework import serializers
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra

class ProveedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proveedor
        fields = '__all__'

class DetalleOrdenCompraSerializer(serializers.ModelSerializer):
    producto_nombre = serializers.CharField(source='producto.nombre', read_only=True)
    class Meta:
        model = DetalleOrdenCompra
        fields = '__all__'
        read_only_fields = ['orden', 'subtotal']

class DetalleOrdenCompraCreateSerializer(serializers.Serializer):
    producto = serializers.IntegerField()
    cantidad = serializers.DecimalField(max_digits=12, decimal_places=2)
    precio_unitario = serializers.DecimalField(max_digits=12, decimal_places=2)

class OrdenCompraSerializer(serializers.ModelSerializer):
    detalles = DetalleOrdenCompraSerializer(many=True, read_only=True)
    proveedor_nombre = serializers.CharField(source='proveedor.nombre', read_only=True)
    class Meta:
        model = OrdenCompra
        fields = '__all__'

class OrdenCompraCreateSerializer(serializers.Serializer):
    proveedor = serializers.IntegerField()
    estado = serializers.CharField(default='borrador')
    fecha_entrega = serializers.DateField(required=False, allow_null=True)
    notas = serializers.CharField(allow_blank=True, default='')
    detalles = DetalleOrdenCompraCreateSerializer(many=True)

    def create(self, validated_data):
        from productos.models import Producto
        from inventario.models import Stock, MovimientoInventario, Almacen

        detalles_data = validated_data.pop('detalles')
        ultimo = OrdenCompra.objects.order_by('-id').first()
        numero = f"OC-{(ultimo.id + 1 if ultimo else 1):04d}"

        orden = OrdenCompra.objects.create(
            numero=numero,
            proveedor_id=validated_data['proveedor'],
            estado=validated_data.get('estado', 'borrador'),
            fecha_entrega=validated_data.get('fecha_entrega'),
            notas=validated_data.get('notas', ''),
        )

        subtotal = 0
        for d in detalles_data:
            producto = Producto.objects.get(id=d['producto'])
            sub = d['cantidad'] * d['precio_unitario']
            DetalleOrdenCompra.objects.create(
                orden=orden,
                producto=producto,
                cantidad=d['cantidad'],
                precio_unitario=d['precio_unitario'],
                subtotal=sub,
            )
            subtotal += sub

            # Agregar al inventario si la orden es recibida
            if validated_data.get('estado') == 'recibida':
                almacen = Almacen.objects.filter(activo=True).first()
                if almacen:
                    MovimientoInventario.objects.create(
                        producto=producto,
                        almacen=almacen,
                        tipo='entrada',
                        cantidad=d['cantidad'],
                        referencia=numero,
                        notas=f'Compra {numero}',
                    )

        orden.subtotal = subtotal
        orden.total = subtotal
        orden.save()

        from contabilidad.utils import asiento_por_compra
        asiento_por_compra(orden)

        return orden
