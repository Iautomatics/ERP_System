from django.contrib import admin
from .models import Almacen, Stock, MovimientoInventario

@admin.register(Almacen)
class AlmacenAdmin(admin.ModelAdmin):
    list_display = ['nombre', 'ubicacion', 'activo']
    search_fields = ['nombre']

@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['producto', 'almacen', 'cantidad']
    list_filter = ['almacen']
    search_fields = ['producto__nombre', 'producto__codigo']

@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = ['fecha', 'tipo', 'producto', 'almacen', 'cantidad', 'referencia']
    list_filter = ['tipo', 'almacen', 'fecha']
    search_fields = ['producto__nombre', 'referencia']
