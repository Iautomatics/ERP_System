from rest_framework.permissions import BasePermission, SAFE_METHODS

def get_rol(user):
    try:
        return user.perfil.rol
    except Exception:
        return 'solo_lectura' if not user.is_staff else 'admin'

class EsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (request.user.is_staff or get_rol(request.user) == 'admin')

class PermisoProductos(BasePermission):
    ROLES_ESCRITURA = ['admin', 'comprador']
    ROLES_LECTURA = ['admin', 'comprador', 'vendedor', 'almacenero', 'contador']

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        rol = get_rol(request.user)
        if request.method in SAFE_METHODS:
            return rol in self.ROLES_LECTURA
        return rol in self.ROLES_ESCRITURA

class PermisoInventario(BasePermission):
    ROLES_ESCRITURA = ['admin', 'almacenero']
    ROLES_LECTURA = ['admin', 'almacenero', 'vendedor', 'comprador', 'contador']

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        rol = get_rol(request.user)
        if request.method in SAFE_METHODS:
            return rol in self.ROLES_LECTURA
        return rol in self.ROLES_ESCRITURA

class PermisoVentas(BasePermission):
    ROLES_ESCRITURA = ['admin', 'vendedor']
    ROLES_LECTURA = ['admin', 'vendedor', 'contador', 'solo_lectura']

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        rol = get_rol(request.user)
        if request.method in SAFE_METHODS:
            return rol in self.ROLES_LECTURA
        return rol in self.ROLES_ESCRITURA

class PermisoCompras(BasePermission):
    ROLES_ESCRITURA = ['admin', 'comprador']
    ROLES_LECTURA = ['admin', 'comprador', 'contador', 'solo_lectura']

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        rol = get_rol(request.user)
        if request.method in SAFE_METHODS:
            return rol in self.ROLES_LECTURA
        return rol in self.ROLES_ESCRITURA

class PermisoContabilidad(BasePermission):
    ROLES_ESCRITURA = ['admin', 'contador']
    ROLES_LECTURA = ['admin', 'contador']

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        rol = get_rol(request.user)
        if request.method in SAFE_METHODS:
            return rol in self.ROLES_LECTURA
        return rol in self.ROLES_ESCRITURA

class PermisoSoloLectura(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        return request.method in SAFE_METHODS
