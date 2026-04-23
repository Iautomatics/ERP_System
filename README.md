# ERP - Sistema de Gestión Empresarial

Sistema ERP completo desarrollado con **Django REST Framework** como backend y **Next.js 16** como frontend. Proyecto construido como solución full-stack para portafolio profesional.
<p align="center">
  <img src="https://raw.githubusercontent.com/Iautomatics/ERP_System/main/images/erp-dashboard.png" width="750"/>
</p>
---

## Tecnologías

### Backend
- Python 3.14 / Django 6.0
- Django REST Framework 3.17
- JWT Authentication (SimpleJWT)
- SQLite (desarrollo) / PostgreSQL (producción)

### Frontend
- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Recharts (gráficos interactivos)

---

## Módulos del Sistema

| Módulo | Descripción |
|---|---|
| **Productos** | Gestión de productos, categorías y precios |
| **Inventario** | Stock por almacén, movimientos de entrada/salida/ajuste |
| **Ventas** | Clientes, órdenes de venta, facturación |
| **Compras** | Proveedores, órdenes de compra |
| **Contabilidad** | Plan de cuentas, asientos automáticos y manuales, balance |
| **Usuarios** | Gestión de usuarios con roles y permisos |
| **Seguridad** | Auditoría de accesos, configuración de seguridad |

---

## Arquitectura

```
┌─────────────────────┐         ┌──────────────────────┐
│   Next.js Frontend  │  HTTP   │   Django REST API     │
│   localhost:3000    │◄───────►│   localhost:8000      │
│                     │   JWT   │                       │
│  - TypeScript       │         │  - REST Framework     │
│  - Tailwind CSS     │         │  - JWT Auth           │
│  - Recharts         │         │  - SQLite DB          │
└─────────────────────┘         └──────────────────────┘
```

---

## Características Principales

- **Autenticación JWT** con refresh automático de tokens
- **Permisos por rol**: admin, contador, vendedor, comprador, almacenero, solo lectura
- **Asientos contables automáticos** generados al crear ventas y compras
- **Stock en tiempo real** actualizado con cada movimiento de inventario
- **Dashboard interactivo** con gráficos por módulo (Recharts)
- **Reportes descargables** en CSV y XML para todos los módulos
- **Auditoría completa** de accesos y acciones del sistema
- **API REST** documentada y consumible por cualquier cliente

---

## Estructura del Proyecto

```
erp-system/
├── backend/                  # Django REST API
│   ├── productos/            # Módulo de productos
│   ├── inventario/           # Módulo de inventario
│   ├── ventas/               # Módulo de ventas
│   ├── compras/              # Módulo de compras
│   ├── contabilidad/         # Módulo contable
│   ├── usuarios/             # Gestión de usuarios y permisos
│   ├── seguridad/            # Auditoría y seguridad
│   ├── reportes/             # Generación de reportes CSV/XML
│   ├── settings.py
│   ├── urls.py
│   └── requirements.txt
│
└── frontend/                 # Next.js App
    ├── app/
    │   ├── (app)/            # Rutas protegidas
    │   │   ├── dashboard/
    │   │   ├── productos/
    │   │   ├── inventario/
    │   │   ├── ventas/
    │   │   ├── compras/
    │   │   ├── contabilidad/
    │   │   ├── usuarios/
    │   │   └── seguridad/
    │   └── login/
    ├── components/
    │   ├── Sidebar.tsx
    │   ├── Modal.tsx
    │   ├── StatCard.tsx
    │   └── BotonesReporte.tsx
    └── lib/
        ├── api.ts            # Cliente HTTP con JWT
        └── AuthContext.tsx   # Contexto de autenticación
```

---

## Instalación y Configuración

### Requisitos
- Python 3.10+
- Node.js 18+
- Git

### Backend (Django)

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/erp-system.git
cd erp-system/backend

# 2. Crear entorno virtual
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux/Mac

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 5. Aplicar migraciones
python manage.py migrate

# 6. Crear superusuario
python manage.py createsuperuser

# 7. Iniciar servidor
python manage.py runserver
```

### Frontend (Next.js)

```bash
# 1. Ir a la carpeta frontend
cd erp-system/frontend

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con la URL del backend

# 4. Iniciar servidor de desarrollo
npm run dev
```

### Acceso
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api
- **Admin Django:** http://localhost:8000/admin

---

## Roles y Permisos

| Módulo | Admin | Contador | Vendedor | Comprador | Almacenero | Solo Lectura |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Productos | R/W | R | R | R/W | R | ❌ |
| Inventario | R/W | R | R | R | R/W | ❌ |
| Ventas | R/W | R | R/W | ❌ | ❌ | R |
| Compras | R/W | R | ❌ | R/W | ❌ | R |
| Contabilidad | R/W | R/W | ❌ | ❌ | ❌ | ❌ |
| Usuarios/Seguridad | R/W | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## API Endpoints Principales

```
POST   /api/token/                    # Login - obtener JWT
POST   /api/token/refresh/            # Renovar token
GET    /api/me/                       # Perfil del usuario autenticado
GET    /api/dashboard/                # Estadísticas del dashboard

GET/POST   /api/productos/            # Productos
GET/POST   /api/inventario/stock/     # Stock actual
GET/POST   /api/ventas/               # Ventas
GET/POST   /api/compras/              # Compras
GET/POST   /api/contabilidad/asientos/ # Asientos contables
GET        /api/contabilidad/asientos/balance/ # Balance general

GET    /api/reportes/productos/csv/   # Reporte CSV
GET    /api/reportes/productos/xml/   # Reporte XML
GET    /api/reportes/ventas/csv/
GET    /api/reportes/ventas/xml/
GET    /api/reportes/compras/csv/
GET    /api/reportes/compras/xml/
GET    /api/reportes/inventario/csv/
GET    /api/reportes/inventario/xml/
GET    /api/reportes/contabilidad/csv/
GET    /api/reportes/contabilidad/xml/
```

---

## Capturas de Pantalla

> Dashboard con gráficos interactivos, módulos de ventas, compras, inventario y contabilidad con reportes descargables.

---

## Autor

Juan Villegas 

Desarrollado como proyecto de portafolio profesional.

- **Stack:** Python · Django · Next.js · TypeScript · Tailwind CSS
- **Tipo:** Full Stack · ERP · REST API · JWT Auth

---

## Licencia

MIT License
