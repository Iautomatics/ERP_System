from django.db import models

class CuentaContable(models.Model):
    TIPO_CHOICES = [
        ('activo', 'Activo'),
        ('pasivo', 'Pasivo'),
        ('patrimonio', 'Patrimonio'),
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    ]
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=200)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES)
    padre = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subcuentas')
    activa = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.codigo} - {self.nombre}"

class AsientoContable(models.Model):
    ORIGEN_CHOICES = [
        ('manual', 'Manual'),
        ('venta', 'Venta'),
        ('compra', 'Compra'),
    ]
    numero = models.CharField(max_length=20, unique=True)
    fecha = models.DateField()
    descripcion = models.TextField()
    referencia = models.CharField(max_length=100, blank=True)
    origen = models.CharField(max_length=20, choices=ORIGEN_CHOICES, default='manual')
    origen_id = models.IntegerField(null=True, blank=True)
    creado = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Asiento {self.numero} - {self.fecha}"

class LineaAsiento(models.Model):
    asiento = models.ForeignKey(AsientoContable, on_delete=models.CASCADE, related_name='lineas')
    cuenta = models.ForeignKey(CuentaContable, on_delete=models.PROTECT)
    debe = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    haber = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    descripcion = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return f"{self.cuenta} | D:{self.debe} H:{self.haber}"
