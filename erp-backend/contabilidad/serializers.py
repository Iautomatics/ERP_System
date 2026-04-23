from rest_framework import serializers
from .models import CuentaContable, AsientoContable, LineaAsiento

class CuentaContableSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuentaContable
        fields = '__all__'

class LineaAsientoSerializer(serializers.ModelSerializer):
    cuenta_nombre = serializers.CharField(source='cuenta.nombre', read_only=True)
    cuenta_codigo = serializers.CharField(source='cuenta.codigo', read_only=True)
    class Meta:
        model = LineaAsiento
        fields = '__all__'

class AsientoContableSerializer(serializers.ModelSerializer):
    lineas = LineaAsientoSerializer(many=True, read_only=True)
    class Meta:
        model = AsientoContable
        fields = '__all__'

class AsientoCreateSerializer(serializers.Serializer):
    fecha = serializers.DateField()
    descripcion = serializers.CharField()
    referencia = serializers.CharField(allow_blank=True, default='')
    lineas = serializers.ListField(child=serializers.DictField())

    def create(self, validated_data):
        from .utils import siguiente_numero
        lineas_data = validated_data.pop('lineas')
        asiento = AsientoContable.objects.create(
            numero=siguiente_numero(),
            origen='manual',
            **validated_data,
        )
        for l in lineas_data:
            LineaAsiento.objects.create(
                asiento=asiento,
                cuenta_id=l['cuenta'],
                debe=l.get('debe', 0),
                haber=l.get('haber', 0),
                descripcion=l.get('descripcion', ''),
            )
        return asiento
