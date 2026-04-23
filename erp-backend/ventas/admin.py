from django.contrib import admin
from .models import Cliente, Venta, DetalleVenta

@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = ['identificacion', 'nombre', 'email', 'telefono', 'activo']
    list_filter = ['activo']
    search_fields = ['nombre', 'identificacion', 'email']

class DetalleVentaInline(admin.TabularInline):
    model = DetalleVenta
    extra = 1

@admin.register(Venta)
class VentaAdmin(admin.ModelAdmin):
    list_display = ['numero', 'cliente', 'fecha', 'estado', 'total']
    list_filter = ['estado', 'fecha']
    search_fields = ['numero', 'cliente__nombre']
    inlines = [DetalleVentaInline]
    readonly_fields = ['subtotal', 'total']
