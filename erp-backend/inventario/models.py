from django.db import models
from productos.models import Producto

class Almacen(models.Model):
    nombre = models.CharField(max_length=100)
    ubicacion = models.CharField(max_length=200, blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class Stock(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE)
    cantidad = models.DecimalField(max_digits=12, decimal_places=2, default=0)

    class Meta:
        unique_together = ['producto', 'almacen']

    def __str__(self):
        return f"{self.producto} - {self.almacen}: {self.cantidad}"

class MovimientoInventario(models.Model):
    TIPO_CHOICES = [
        ('entrada', 'Entrada'),
        ('salida', 'Salida'),
        ('ajuste', 'Ajuste'),
        ('traslado', 'Traslado'),
    ]
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    almacen = models.ForeignKey(Almacen, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    cantidad = models.DecimalField(max_digits=12, decimal_places=2)
    referencia = models.CharField(max_length=100, blank=True)
    fecha = models.DateTimeField(auto_now_add=True)
    notas = models.TextField(blank=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        stock, _ = Stock.objects.get_or_create(
            producto=self.producto,
            almacen=self.almacen,
            defaults={'cantidad': 0}
        )
        if self.tipo == 'entrada':
            stock.cantidad += self.cantidad
        elif self.tipo == 'salida':
            stock.cantidad -= self.cantidad
        elif self.tipo == 'ajuste':
            stock.cantidad = self.cantidad
        stock.save()

    def __str__(self):
        return f"{self.tipo} - {self.producto} ({self.cantidad})"
