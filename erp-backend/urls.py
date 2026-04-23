from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
from seguridad.views import LoginAuditView
import datetime

from productos.views import CategoriaViewSet, ProductoViewSet
from inventario.views import AlmacenViewSet, StockViewSet, MovimientoInventarioViewSet
from ventas.views import ClienteViewSet, VentaViewSet, DetalleVentaViewSet
from compras.views import ProveedorViewSet, OrdenCompraViewSet, DetalleOrdenCompraViewSet
from contabilidad.views import CuentaContableViewSet, AsientoContableViewSet
from usuarios.views import UsuarioViewSet, PerfilViewSet
from seguridad.views import AuditoriaAccesoViewSet, ConfiguracionSeguridadViewSet
from reportes.views import (
    reporte_productos_csv, reporte_productos_xml,
    reporte_inventario_csv, reporte_inventario_xml,
    reporte_ventas_csv, reporte_ventas_xml,
    reporte_compras_csv, reporte_compras_xml,
    reporte_contabilidad_csv, reporte_contabilidad_xml,
)

router = DefaultRouter()
router.register('productos/categorias', CategoriaViewSet)
router.register('productos', ProductoViewSet)
router.register('inventario/almacenes', AlmacenViewSet)
router.register('inventario/stock', StockViewSet)
router.register('inventario/movimientos', MovimientoInventarioViewSet)
router.register('ventas/clientes', ClienteViewSet)
router.register('ventas', VentaViewSet)
router.register('compras/proveedores', ProveedorViewSet)
router.register('compras', OrdenCompraViewSet)
router.register('contabilidad/cuentas', CuentaContableViewSet)
router.register('contabilidad/asientos', AsientoContableViewSet)
router.register('usuarios', UsuarioViewSet)
router.register('usuarios/perfiles', PerfilViewSet)
router.register('seguridad/auditoria', AuditoriaAccesoViewSet)
router.register('seguridad/configuracion', ConfiguracionSeguridadViewSet)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard(request):
    from productos.models import Producto
    from ventas.models import Venta, Cliente
    from compras.models import OrdenCompra, Proveedor
    from inventario.models import Stock
    from django.db.models import Sum, Count
    from django.utils import timezone

    hoy = timezone.now().date()
    ventas_meses = []
    for i in range(5, -1, -1):
        mes = (hoy.replace(day=1) - datetime.timedelta(days=i * 30))
        total = Venta.objects.filter(fecha__year=mes.year, fecha__month=mes.month).aggregate(t=Sum('total'))['t'] or 0
        ventas_meses.append({'mes': mes.strftime('%b %Y'), 'total': float(total)})

    compras_meses = []
    for i in range(5, -1, -1):
        mes = (hoy.replace(day=1) - datetime.timedelta(days=i * 30))
        total = OrdenCompra.objects.filter(fecha__year=mes.year, fecha__month=mes.month).aggregate(t=Sum('total'))['t'] or 0
        compras_meses.append({'mes': mes.strftime('%b %Y'), 'total': float(total)})

    ventas_estado = [{'estado': v['estado'], 'total': v['cantidad_ordenes'], 'monto': float(v['monto'] or 0)} for v in Venta.objects.values('estado').annotate(cantidad_ordenes=Count('id'), monto=Sum('total'))]
    compras_estado = [{'estado': v['estado'], 'total': v['cantidad_ordenes'], 'monto': float(v['monto'] or 0)} for v in OrdenCompra.objects.values('estado').annotate(cantidad_ordenes=Count('id'), monto=Sum('total'))]
    productos_categoria = [{'categoria__nombre': v['categoria__nombre'] or 'Sin categoría', 'total': v['total']} for v in Producto.objects.filter(activo=True).values('categoria__nombre').annotate(total=Count('id'))]
    stock_items = [{'producto__nombre': v['producto__nombre'], 'cantidad': float(v['cantidad'] or 0)} for v in Stock.objects.select_related('producto').values('producto__nombre').annotate(cantidad=Sum('cantidad')).order_by('-cantidad')[:8]]

    return Response({
        'productos': Producto.objects.filter(activo=True).count(),
        'clientes': Cliente.objects.filter(activo=True).count(),
        'proveedores': Proveedor.objects.filter(activo=True).count(),
        'ventas_total': float(Venta.objects.aggregate(total=Sum('total'))['total'] or 0),
        'compras_total': float(OrdenCompra.objects.aggregate(total=Sum('total'))['total'] or 0),
        'ventas_count': Venta.objects.count(),
        'compras_count': OrdenCompra.objects.count(),
        'ventas_meses': ventas_meses,
        'compras_meses': compras_meses,
        'ventas_estado': ventas_estado,
        'compras_estado': compras_estado,
        'productos_categoria': productos_categoria,
        'stock_items': stock_items,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def health(request):
    from django.db import connection
    db_ok = False
    try:
        connection.ensure_connection()
        db_ok = True
    except Exception:
        pass
    return Response({
        'api': True,
        'base_datos': db_ok,
        'autenticacion': request.user.is_authenticated,
        'usuario': request.user.username,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    from usuarios.permisos import get_rol
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'email': request.user.email,
        'first_name': request.user.first_name,
        'last_name': request.user.last_name,
        'is_staff': request.user.is_staff,
        'rol': get_rol(request.user),
    })

admin.site.site_header = 'ERP - Sistema de Gestión Empresarial'
admin.site.site_title = 'ERP Admin'
admin.site.index_title = 'Panel de Administración'

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/')),
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/dashboard/', dashboard),
    path('api/me/', me),
    path('api/health/', health),
    path('api/token/', LoginAuditView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    path('api/reportes/productos/csv/', reporte_productos_csv),
    path('api/reportes/productos/xml/', reporte_productos_xml),
    path('api/reportes/inventario/csv/', reporte_inventario_csv),
    path('api/reportes/inventario/xml/', reporte_inventario_xml),
    path('api/reportes/ventas/csv/', reporte_ventas_csv),
    path('api/reportes/ventas/xml/', reporte_ventas_xml),
    path('api/reportes/compras/csv/', reporte_compras_csv),
    path('api/reportes/compras/xml/', reporte_compras_xml),
    path('api/reportes/contabilidad/csv/', reporte_contabilidad_csv),
    path('api/reportes/contabilidad/xml/', reporte_contabilidad_xml),
]
