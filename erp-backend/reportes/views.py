import csv
import xml.etree.ElementTree as ET
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated


def csv_response(filename):
    response = HttpResponse(content_type='text/csv; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    response.write('\ufeff')
    return response


def xml_response(filename):
    response = HttpResponse(content_type='application/xml; charset=utf-8')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_productos_csv(request):
    from productos.models import Producto
    response = csv_response('productos.csv')
    writer = csv.writer(response)
    writer.writerow(['Código', 'Nombre', 'Categoría', 'Precio Compra', 'Precio Venta', 'Stock Mínimo', 'Activo'])
    for p in Producto.objects.select_related('categoria').all():
        writer.writerow([p.codigo, p.nombre, p.categoria.nombre if p.categoria else '', p.precio_compra, p.precio_venta, p.stock_minimo, 'Sí' if p.activo else 'No'])
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_productos_xml(request):
    from productos.models import Producto
    root = ET.Element('productos')
    for p in Producto.objects.select_related('categoria').all():
        item = ET.SubElement(root, 'producto')
        ET.SubElement(item, 'codigo').text = p.codigo
        ET.SubElement(item, 'nombre').text = p.nombre
        ET.SubElement(item, 'categoria').text = p.categoria.nombre if p.categoria else ''
        ET.SubElement(item, 'precio_compra').text = str(p.precio_compra)
        ET.SubElement(item, 'precio_venta').text = str(p.precio_venta)
        ET.SubElement(item, 'stock_minimo').text = str(p.stock_minimo)
        ET.SubElement(item, 'activo').text = 'true' if p.activo else 'false'
    response = xml_response('productos.xml')
    response.content = ET.tostring(root, encoding='unicode')
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_inventario_csv(request):
    from inventario.models import Stock
    response = csv_response('inventario.csv')
    writer = csv.writer(response)
    writer.writerow(['Producto', 'Código', 'Almacén', 'Cantidad'])
    for s in Stock.objects.select_related('producto', 'almacen').all():
        writer.writerow([s.producto.nombre, s.producto.codigo, s.almacen.nombre, s.cantidad])
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_inventario_xml(request):
    from inventario.models import Stock
    root = ET.Element('inventario')
    for s in Stock.objects.select_related('producto', 'almacen').all():
        item = ET.SubElement(root, 'stock')
        ET.SubElement(item, 'producto').text = s.producto.nombre
        ET.SubElement(item, 'codigo').text = s.producto.codigo
        ET.SubElement(item, 'almacen').text = s.almacen.nombre
        ET.SubElement(item, 'cantidad').text = str(s.cantidad)
    response = xml_response('inventario.xml')
    response.content = ET.tostring(root, encoding='unicode')
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_ventas_csv(request):
    from ventas.models import Venta
    response = csv_response('ventas.csv')
    writer = csv.writer(response)
    writer.writerow(['Número', 'Cliente', 'Fecha', 'Estado', 'Subtotal', 'Total'])
    for v in Venta.objects.select_related('cliente').all():
        writer.writerow([v.numero, v.cliente.nombre, v.fecha.strftime('%Y-%m-%d'), v.estado, v.subtotal, v.total])
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_ventas_xml(request):
    from ventas.models import Venta
    root = ET.Element('ventas')
    for v in Venta.objects.select_related('cliente').prefetch_related('detalles__producto').all():
        item = ET.SubElement(root, 'venta')
        ET.SubElement(item, 'numero').text = v.numero
        ET.SubElement(item, 'cliente').text = v.cliente.nombre
        ET.SubElement(item, 'fecha').text = v.fecha.strftime('%Y-%m-%d')
        ET.SubElement(item, 'estado').text = v.estado
        ET.SubElement(item, 'subtotal').text = str(v.subtotal)
        ET.SubElement(item, 'total').text = str(v.total)
        detalles = ET.SubElement(item, 'detalles')
        for d in v.detalles.all():
            det = ET.SubElement(detalles, 'detalle')
            ET.SubElement(det, 'producto').text = d.producto.nombre
            ET.SubElement(det, 'cantidad').text = str(d.cantidad)
            ET.SubElement(det, 'precio_unitario').text = str(d.precio_unitario)
            ET.SubElement(det, 'subtotal').text = str(d.subtotal)
    response = xml_response('ventas.xml')
    response.content = ET.tostring(root, encoding='unicode')
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_compras_csv(request):
    from compras.models import OrdenCompra
    response = csv_response('compras.csv')
    writer = csv.writer(response)
    writer.writerow(['Número', 'Proveedor', 'Fecha', 'Estado', 'Subtotal', 'Total'])
    for c in OrdenCompra.objects.select_related('proveedor').all():
        writer.writerow([c.numero, c.proveedor.nombre, c.fecha.strftime('%Y-%m-%d'), c.estado, c.subtotal, c.total])
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_compras_xml(request):
    from compras.models import OrdenCompra
    root = ET.Element('compras')
    for c in OrdenCompra.objects.select_related('proveedor').prefetch_related('detalles__producto').all():
        item = ET.SubElement(root, 'orden')
        ET.SubElement(item, 'numero').text = c.numero
        ET.SubElement(item, 'proveedor').text = c.proveedor.nombre
        ET.SubElement(item, 'fecha').text = c.fecha.strftime('%Y-%m-%d')
        ET.SubElement(item, 'estado').text = c.estado
        ET.SubElement(item, 'subtotal').text = str(c.subtotal)
        ET.SubElement(item, 'total').text = str(c.total)
        detalles = ET.SubElement(item, 'detalles')
        for d in c.detalles.all():
            det = ET.SubElement(detalles, 'detalle')
            ET.SubElement(det, 'producto').text = d.producto.nombre
            ET.SubElement(det, 'cantidad').text = str(d.cantidad)
            ET.SubElement(det, 'precio_unitario').text = str(d.precio_unitario)
            ET.SubElement(det, 'subtotal').text = str(d.subtotal)
    response = xml_response('compras.xml')
    response.content = ET.tostring(root, encoding='unicode')
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_contabilidad_csv(request):
    from contabilidad.models import AsientoContable
    response = csv_response('contabilidad.csv')
    writer = csv.writer(response)
    writer.writerow(['Asiento', 'Fecha', 'Descripción', 'Referencia', 'Origen', 'Cuenta', 'Debe', 'Haber'])
    for a in AsientoContable.objects.prefetch_related('lineas__cuenta').all():
        for l in a.lineas.all():
            writer.writerow([a.numero, a.fecha, a.descripcion, a.referencia, a.origen, f'{l.cuenta.codigo} - {l.cuenta.nombre}', l.debe, l.haber])
    return response


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_contabilidad_xml(request):
    from contabilidad.models import AsientoContable
    root = ET.Element('contabilidad')
    for a in AsientoContable.objects.prefetch_related('lineas__cuenta').all():
        asiento = ET.SubElement(root, 'asiento')
        ET.SubElement(asiento, 'numero').text = a.numero
        ET.SubElement(asiento, 'fecha').text = str(a.fecha)
        ET.SubElement(asiento, 'descripcion').text = a.descripcion
        ET.SubElement(asiento, 'referencia').text = a.referencia
        ET.SubElement(asiento, 'origen').text = a.origen
        lineas = ET.SubElement(asiento, 'lineas')
        for l in a.lineas.all():
            linea = ET.SubElement(lineas, 'linea')
            ET.SubElement(linea, 'cuenta').text = f'{l.cuenta.codigo} - {l.cuenta.nombre}'
            ET.SubElement(linea, 'debe').text = str(l.debe)
            ET.SubElement(linea, 'haber').text = str(l.haber)
    response = xml_response('contabilidad.xml')
    response.content = ET.tostring(root, encoding='unicode')
    return response
