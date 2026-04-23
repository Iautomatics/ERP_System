from django.contrib import admin
from .models import CuentaContable, AsientoContable, LineaAsiento

@admin.register(CuentaContable)
class CuentaContableAdmin(admin.ModelAdmin):
    list_display = ['codigo', 'nombre', 'tipo', 'padre', 'activa']
    list_filter = ['tipo', 'activa']
    search_fields = ['codigo', 'nombre']

class LineaAsientoInline(admin.TabularInline):
    model = LineaAsiento
    extra = 2

@admin.register(AsientoContable)
class AsientoContableAdmin(admin.ModelAdmin):
    list_display = ['numero', 'fecha', 'descripcion', 'referencia']
    list_filter = ['fecha']
    search_fields = ['numero', 'descripcion', 'referencia']
    inlines = [LineaAsientoInline]
