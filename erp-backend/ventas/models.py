from django.db import models
from django.contrib.auth.models import User
from productos.models import Producto

class Cliente(models.Model):
    nombre = models.CharField(max_length=200)
    identificacion = models.CharField(max_length=50, unique=True)
    email = models.EmailField(blank=True)
    telefono = models.CharField(max_length=20, blank=True)
    direccion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.identificacion} - {self.nombre}"

class Venta(models.Model):
    ESTADO_CHOICES = [
        ('borrador', 'Borrador'),
        ('confirmada', 'Confirmada'),
        ('facturada', 'Facturada'),
        ('anulada', 'Anulada'),
    ]
    numero = models.CharField(max_length=20, unique=True)
    cliente = models.ForeignKey(Cliente, on_delete=models.PROTECT)
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='borrador')
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    impuesto = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    usuario = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    notas = models.TextField(blank=True)

    def __str__(self):
        return f"Venta {self.numero} - {self.cliente}"

class DetalleVenta(models.Model):
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='detalles')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.DecimalField(max_digits=12, decimal_places=2)
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    descuento = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    subtotal = models.DecimalField(max_digits=14, decimal_places=2)

    def save(self, *args, **kwargs):
        self.subtotal = self.cantidad * self.precio_unitario * (1 - self.descuento / 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.venta.numero} - {self.producto}"
