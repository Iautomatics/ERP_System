from django.contrib import admin
from .models import AuditoriaAcceso, ConfiguracionSeguridad

@admin.register(AuditoriaAcceso)
class AuditoriaAccesoAdmin(admin.ModelAdmin):
    list_display = ['fecha', 'usuario', 'accion', 'modulo', 'ip', 'exitoso']
    list_filter = ['modulo', 'exitoso', 'fecha']
    search_fields = ['usuario__username', 'accion', 'modulo']
    readonly_fields = ['usuario', 'accion', 'modulo', 'ip', 'fecha', 'exitoso', 'detalle']

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

@admin.register(ConfiguracionSeguridad)
class ConfiguracionSeguridadAdmin(admin.ModelAdmin):
    list_display = ['intentos_maximos', 'tiempo_bloqueo_minutos', 'sesion_expira_minutos', 'requiere_2fa']
