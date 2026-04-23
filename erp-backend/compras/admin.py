from django.contrib import admin
from .models import Proveedor, OrdenCompra, DetalleOrdenCompra

@admin.register(Proveedor)
class ProveedorAdmin(admin.ModelAdmin):
    list_display = ['identificacion', 'nombre', 'email', 'telefono', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'identificacion']

class DetalleOrdenCompraInline(admin.TabularInline):
    model = DetalleOrdenCompra
    extra = 1

@admin.register(OrdenCompra)
class OrdenCompraAdmin(admin.ModelAdmin):
    list_display = ['numero', 'proveedor', 'fecha', 'estado', 'total']
    list_filter = ['estado', 'fecha']
    search_fields = ['numero', 'proveedor__nombre']
    inlines = [DetalleOrdenCompraInline]
    readonly_fields = ['subtotal', 'total']
