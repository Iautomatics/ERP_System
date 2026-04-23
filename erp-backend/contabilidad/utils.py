from django.utils import timezone
from .models import AsientoContable, LineaAsiento, CuentaContable

CUENTAS_BASE = [
    ('1101', 'Caja y Bancos', 'activo'),
    ('1201', 'Cuentas por Cobrar', 'activo'),
    ('1301', 'Inventario', 'activo'),
    ('2101', 'Cuentas por Pagar', 'pasivo'),
    ('4101', 'Ingresos por Ventas', 'ingreso'),
    ('5101', 'Costo de Compras', 'gasto'),
]

def crear_cuentas_base():
    for codigo, nombre, tipo in CUENTAS_BASE:
        CuentaContable.objects.get_or_create(codigo=codigo, defaults={'nombre': nombre, 'tipo': tipo})

def get_cuenta(codigo):
    try:
        return CuentaContable.objects.get(codigo=codigo)
    except CuentaContable.DoesNotExist:
        crear_cuentas_base()
        return CuentaContable.objects.get(codigo=codigo)

def siguiente_numero():
    ultimo = AsientoContable.objects.order_by('-id').first()
    return f"AST-{(ultimo.id + 1 if ultimo else 1):04d}"

def asiento_por_venta(venta):
    if AsientoContable.objects.filter(origen='venta', origen_id=venta.id).exists():
        return
    asiento = AsientoContable.objects.create(
        numero=siguiente_numero(),
        fecha=timezone.now().date(),
        descripcion=f'Venta {venta.numero} - {venta.cliente}',
        referencia=venta.numero,
        origen='venta',
        origen_id=venta.id,
    )
    LineaAsiento.objects.create(asiento=asiento, cuenta=get_cuenta('1201'), debe=venta.total, haber=0, descripcion='Cuentas por cobrar')
    LineaAsiento.objects.create(asiento=asiento, cuenta=get_cuenta('4101'), debe=0, haber=venta.total, descripcion='Ingreso por venta')

def asiento_por_compra(orden):
    if AsientoContable.objects.filter(origen='compra', origen_id=orden.id).exists():
        return
    asiento = AsientoContable.objects.create(
        numero=siguiente_numero(),
        fecha=timezone.now().date(),
        descripcion=f'Compra {orden.numero} - {orden.proveedor}',
        referencia=orden.numero,
        origen='compra',
        origen_id=orden.id,
    )
    LineaAsiento.objects.create(asiento=asiento, cuenta=get_cuenta('1301'), debe=orden.total, haber=0, descripcion='Entrada a inventario')
    LineaAsiento.objects.create(asiento=asiento, cuenta=get_cuenta('2101'), debe=0, haber=orden.total, descripcion='Cuentas por pagar')
