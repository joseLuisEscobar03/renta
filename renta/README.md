# RentaFácil — Sistema de Gestión Inmobiliaria y Cobranzas

**RentaFácil** es una aplicación web full-stack diseñada para propietarios, administradores y pequeñas inmobiliarias para gestionar de manera integral y automatizada propiedades en alquiler, contratos de arrendamiento, cobros mensuales, control de mora y envío ágil de recordatorios por WhatsApp y correo electrónico.

---

## 🚀 Inicio Rápido en Local

### 1. Requisitos Previos
- **Node.js**: Versión 22.5 o superior (recomendado 22 LTS).
- **npm**: Gestor de paquetes incluido con Node.js.

### 2. Instalación de Dependencias
En la carpeta raíz del proyecto, ejecuta:

```bash
npm run install:all
```

*O si prefieres instalar manualmente:*
```bash
# En la carpeta server
cd server
npm install

# En la carpeta client
cd ../client
npm install
```

### 3. Iniciar la Aplicación (Frontend + Backend)
Desde la raíz del proyecto, ejecuta un único comando:

```bash
npm run dev
```

Esto levantará automáticamente:
- 🌐 **Frontend (React + Vite)**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend API (Express + SQLite)**: [http://localhost:3001](http://localhost:3001)

---

## 🔑 Primer acceso

1. Copia `.env.example` como `.env` y completa `JWT_SECRET`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
2. Al arrancar por primera vez con la base vacía, se crea solo el usuario administrador con esos datos. No se crea ninguna propiedad, inquilino ni pago de ejemplo.
3. Inicia sesión con ese correo y contraseña. Después de la primera vez, cambiar `ADMIN_PASSWORD` en `.env` no modifica la contraseña ya guardada.

> Requiere **Node.js 22.5 o superior** (usa el módulo integrado `node:sqlite`).

---

## ✨ Funcionalidades Principales

### 1. 📊 Panel Principal (Dashboard)
- **Métricas financieras en tiempo real**: Renta mensual estimada, total cobrado en el mes con porcentaje de avance, deuda acumulada total y porcentaje de ocupación de propiedades.
- **Cobros pendientes del mes**: Barra de progreso por cada inquilino indicando saldo cubierto y saldo restante.
- **Deudores acumulados**: Listado ordenado por mayor saldo deudor con acceso rápido para abonar.
- **Accesos directos**: Botones rápidos para agregar inquilino, agregar propiedad, registrar pago o ir a recordatorios.

### 2. 🏢 Gestión de Propiedades
- Catálogo responsivo en tarjetas con tipos de inmueble (Apartamentos, Casas, Locales comerciales, Bodegas, Terrenos).
- Estado visual de disponibilidad (*Ocupada* con nombre de los inquilinos alojados / *Disponible*).
- Modal para agregar y editar propiedades con validación.
- Modal de detalle con ficha técnica y listado de contratos activos.

### 3. 👥 Inquilinos y Contratos
- Tabla completa con avatar monograma coloreado según estado financiero (*Al día* en verde, *Deuda parcial* en ámbar, *Mora crítica* en rojo).
- Registro con DUI, teléfono internacional WhatsApp, país, ciudad, día de corte de cuota (1 al 28), depósito y notas.
- **Ficha individual del inquilino**: Muestra el historial contable de los últimos 6 meses con indicadores visuales (✅ Pagado, ⚠️ Abono parcial, ❌ Sin pago) y cálculo exacto de días de mora.

### 4. 💳 Control de Cobros y Pagos
- **Libro contable por período (Ledger)**: Filtros por *Todos*, *Pagados*, *Pendientes* y *Atrasados*.
- **Historial de recibos**: Vista cronológica de transacciones individuales con opción de eliminar comprobantes.
- **Modal de pago inteligente**: Al seleccionar al inquilino, se auto-completa el monto pactado de la renta y la fecha actual.

### 5. 📲 Motor de Recordatorios Inteligentes (WhatsApp y Correo)
- Detección automática según la fecha actual:
  - *Vence pronto* (aviso preventivo 3 días antes del corte).
  - *Vence hoy* (recordatorio el mismo día de pago).
  - *Pago atrasado* (con conteo dinámico de días de mora transcurridos).
  - *Deuda acumulada* (para inquilinos con 2 o más cuotas pendientes).
- **Botón directo de WhatsApp**: Abre `https://wa.me/{telefono}?text={mensaje}` con el texto ya formateado según el tono configurado.
- **Botón directo de Correo**: Abre el cliente de correo predeterminado (`mailto:`).
- **Editor en caliente**: Permite ajustar el texto de cobranza antes del envío.
- **Control de estado**: Contador de recordatorios pendientes en la barra lateral y opción de marcar/desmarcar como enviado con registro de fecha.

### 6. ⚙️ Configuración de Cobranza
- Activación o desactivación de momentos de recordatorio (3 días antes, al vencimiento, mora por días, mora múltiple).
- **Selector de tonos**:
  - *Amigable y cordial* (con emojis y saludo cercano).
  - *Formal y profesional* (redacción corporativa formal).
  - *Firme y directo* (enfoque contractual y cobro inmediato).
- Personalización del nombre del propietario o empresa para la firma automática al pie de los mensajes.

---

## 🏗️ Arquitectura Técnica

```
renta/
├── package.json                   # Orquestación con concurrently ("npm run dev")
├── README.md                      # Documentación del proyecto
│
├── server/                        # Backend REST (Node.js + Express + SQLite)
│   ├── package.json
│   ├── rentafacil.db              # Base de datos SQLite local generada automáticamente
│   └── src/
│       ├── index.js               # Punto de entrada del servidor Express (Puerto 3001)
│       ├── db.js                  # Inicialización DDL y datos semilla
│       ├── routes/                # Endpoints REST (auth, properties, tenants, payments, reminders, settings, stats)
│       └── services/
│           ├── financeService.js  # Motor financiero, períodos y cálculo de mora
│           └── reminderEngine.js  # Generador de plantillas y enlaces WhatsApp/email
│
└── client/                        # Frontend SPA (React + Vite + Tailwind CSS)
    ├── package.json
    ├── vite.config.js             # Configuración con Proxy hacia http://localhost:3001
    ├── tailwind.config.js         # Tokens de diseño, fuentes y paleta
    ├── index.html                 # Carga de tipografías DM Sans y DM Mono
    └── src/
        ├── main.jsx
        ├── App.jsx                # Layout con Icon Rail, Topbar y ruteador de vistas
        ├── index.css              # Directivas Tailwind y estilos de scroll
        ├── context/AppContext.jsx # Estado global de sesión, navegación y notificaciones
        ├── services/api.js        # Cliente HTTP centralizado
        ├── components/
        │   ├── common/            # Modal accesible (HTML5 dialog), StatCard, Badge
        │   ├── layout/            # Sidebar (Icon Rail) y Topbar
        │   ├── auth/              # LoginView
        │   ├── dashboard/         # DashboardView
        │   ├── properties/        # PropertiesView, PropertyModal, PropertyDetailModal
        │   ├── tenants/           # TenantsView, TenantModal, TenantDetailModal
        │   ├── payments/          # PaymentsView, PaymentModal
        │   ├── reminders/         # RemindersView, ReminderCard, ReminderEditModal
        │   └── settings/          # SettingsView
        └── utils/formatters.js    # Formato de moneda ($ USD), fechas e iniciales
```

---

## 🛠️ Comandos Disponibles

| Comando | Ubicación | Descripción |
| :--- | :--- | :--- |
| `npm run dev` | Raíz | Inicia simultáneamente el servidor backend y el cliente Vite. |
| `npm run install:all` | Raíz | Instala todas las dependencias tanto en el backend como en el frontend. |
| `npm run build` | Raíz | Compila los assets de producción del frontend en `client/dist`. |
| `npm run dev --prefix server` | Raíz | Ejecuta únicamente el backend en modo desarrollo. |
| `npm run dev --prefix client` | Raíz | Ejecuta únicamente el frontend Vite. |

---

## 📄 Licencia

Este proyecto fue desarrollado bajo estándares de código limpio, accesible y mantenible para uso comercial y personal.
