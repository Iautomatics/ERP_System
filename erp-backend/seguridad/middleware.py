import json

MODULOS = {
    '/api/productos': 'Productos',
    '/api/inventario': 'Inventario',
    '/api/ventas': 'Ventas',
    '/api/compras': 'Compras',
    '/api/contabilidad': 'Contabilidad',
    '/api/usuarios': 'Usuarios',
    '/api/seguridad': 'Seguridad',
}

ACCIONES = {
    'POST': 'Crear',
    'PUT': 'Actualizar',
    'PATCH': 'Actualizar',
    'DELETE': 'Eliminar',
}

class AuditoriaMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        try:
            if request.method in ACCIONES and request.path.startswith('/api/') and request.path != '/api/token/':
                if request.user and request.user.is_authenticated:
                    modulo = next((v for k, v in MODULOS.items() if request.path.startswith(k)), 'Sistema')
                    accion = ACCIONES[request.method]
                    exitoso = response.status_code < 400
                    from seguridad.models import AuditoriaAcceso
                    from seguridad.views import get_ip
                    AuditoriaAcceso.objects.create(
                        usuario=request.user,
                        accion=f'{accion} en {modulo}',
                        modulo=modulo,
                        ip=get_ip(request),
                        exitoso=exitoso,
                        detalle=f'{request.method} {request.path} - Status: {response.status_code}',
                    )
        except Exception:
            pass
        return response
