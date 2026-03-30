# 📋 Plan de Desarrollo - Dashboard PWR Club

**Fecha:** 2026-03-27  
**Fuente de datos:** Supabase (`nfdffurucafdrjuhqeqs`)  
**Stack:** Next.js 14 + Supabase + Vercel

---

## 🏗️ Estructura de Archivos Propuesta

```
pwr-dashboard-new/
├── api/                          # API routes (Next.js App Router compatible)
│   ├── clientes/
│   │   ├── route.js              # GET /api/clientes
│   │   └── [id]/route.js         # GET /api/clientes/:id
│   ├── vencimientos/
│   │   └── route.js              # GET /api/vencimientos
│   ├── ingresos/
│   │   └── route.js              # GET /api/ingresos
│   ├── sucursales/
│   │   └── route.js              # GET /api/sucursales
│   └── dashboard/
│       └── route.js              # GET /api/dashboard (KPIs resumen)
│
├── app/                          # Next.js App Router
│   ├── layout.js                 # Layout principal
│   ├── page.js                   # Home / Resumen
│   ├── clientes/
│   │   └── page.js               # Página de clientes
│   ├── vencimientos/
│   │   └── page.js               # Página de vencimientos
│   ├── ingresos/
│   │   └── page.js               # Página de ingresos
│   └── sucursales/
│       └── page.js               # Página de sucursales
│
├── components/                   # Componentes React reutilizables
│   ├── ui/
│   │   ├── Card.js               # Tarjeta de KPI
│   │   ├── Table.js              # Tabla de datos
│   │   ├── Badge.js              # Badge de estado
│   │   └── Loading.js            # Loading spinner
│   ├── dashboard/
│   │   ├── KPICards.js           # Grid de KPIs
│   │   ├── RevenueChart.js       # Gráfica de ingresos
│   │   └── ExpiringPlans.js      # Lista de planes por vencer
│   └── layout/
│       ├── Header.js             # Header con logo
│       └── Sidebar.js            # Navegación lateral
│
├── lib/
│   ├── supabase.js               # Cliente Supabase configurado
│   └── utils.js                  # Funciones helper (formatCurrency, etc)
│
├── public/
│   ├── logo.png                  # Logo PWR Club
│   └── favicon.ico
│
├── .env.local                    # Variables de entorno (NO commitear)
├── next.config.js
├── package.json
└── vercel.json
```

---

## 📦 Tablas Supabase Requeridas

| Tabla | Campos principales | Uso |
|-------|-------------------|-----|
| `clientes` | identificacion, nombre_completo, celular, correo_electronico, estado, estado_cliente, sucursal, fecha_ingreso | Listado clientes, filtros |
| `facturas` | id, identificacion_cliente, nombre_cliente, fecha_vencimiento, total, sucursal_codigo, estado_anulada | Vencimientos, ingresos |
| `ingresos` | id, fecha, valor, sucursal, vendedor, tipo | Módulo de ingresos |
| `sucursales` | codigo, nombre, direccion | Filtros por sede |
| `cortesias` | id, identificacion_cliente, fecha, origen, convertido | Módulo de cortesías |

---

## 🎯 Fases de Desarrollo

### Fase 1: Configuración Base ✅
- [ ] Migrar de Pages Router a App Router (Next.js 14)
- [ ] Configurar cliente Supabase en `lib/supabase.js`
- [ ] Crear `.env.local` con variables
- [ ] Configurar layout principal con Sidebar

### Fase 2: API Routes
- [ ] `GET /api/dashboard` - KPIs generales
- [ ] `GET /api/clientes` - Listado con filtros
- [ ] `GET /api/vencimientos` - Planes por vencer
- [ ] `GET /api/ingresos` - Ingresos por fecha/sede
- [ ] `GET /api/sucursales` - Lista de sucursales

### Fase 3: Frontend - Módulo Resumen (Home)
- [ ] Header con logo PWR Club
- [ ] Sidebar de navegación
- [ ] KPICards (Clientes activos, Sin plan, Ingresos mes, Por vencer)
- [ ] Gráfica de ingresos últimos 30 días
- [ ] Lista rápida de planes por vencer (7 días)

### Fase 4: Frontend - Módulo Clientes
- [ ] Tabla con listado completo
- [ ] Búsqueda por nombre/ID
- [ ] Filtros: sede, estado, tipo de plan
- [ ] Badge de estado (activo/sin plan/vigente)
- [ ] Exportar a CSV

### Fase 5: Frontend - Módulo Vencimientos
- [ ] Tabla de vencimientos próximos
- [ ] Alertas visuales (rojo <3 días, amarillo <7 días)
- [ ] Filtros por rango de fechas
- [ ] Acciones rápidas (email, WhatsApp)

### Fase 6: Frontend - Módulo Ingresos
- [ ] Gráfica diaria/semanal/mensual
- [ ] Desglose por sucursal
- [ ] Top vendedores
- [ ] Comparativa mes actual vs anterior

### Fase 7: Frontend - Módulo Sucursales
- [ ] Comparativo entre sedes
- [ ] KPIs por sucursal
- [ ] Mapa o lista de ubicaciones

---

## 🔐 Variables de Entorno (.env.local)

```env
SUPABASE_URL=https://nfdffurucafdrjuhqeqs.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_NAME=PWR Club Dashboard
NEXT_PUBLIC_TIMEZONE=America/Bogota
```

---

## 📊 APIs - Especificación

### GET /api/dashboard
**Respuesta:**
```json
{
  "clientes": {
    "total": 1250,
    "activos": 980,
    "sinPlan": 270,
    "porVencer7Dias": 45
  },
  "ingresos": {
    "mesActual": 125000000,
    "mesAnterior": 118000000,
    "variacion": 5.9
  },
  "sucursales": [
    {"codigo": "1", "nombre": "Poblado", "clientes": 450},
    {"codigo": "2", "nombre": "Amsterdam", "clientes": 380},
    {"codigo": "3", "nombre": "Saboleta", "clientes": 150}
  ]
}
```

### GET /api/clientes
**Query params:** `?sede=1&estado=ACTIVO&busqueda=juan`  
**Respuesta:**
```json
{
  "total": 980,
  "clientes": [
    {
      "identificacion": "1017237550",
      "nombre_completo": "MATEO BOTERO UPEGUI",
      "celular": "3147284680",
      "correo_electronico": "mateobu2@hotmail.com",
      "estado": "ACTIVO",
      "estado_cliente": "Sin plan vigente",
      "sucursal": 1,
      "fecha_ingreso": "2026/02/09"
    }
  ]
}
```

### GET /api/vencimientos
**Query params:** `?dias=7&sede=1`  
**Respuesta:**
```json
{
  "periodo": {"inicio": "2026-03-27", "fin": "2026-04-03"},
  "totales": {"cantidad": 45, "valor": 12500000},
  "detalle": [
    {
      "id": 1234,
      "identificacion_cliente": "1017237550",
      "nombre_cliente": "MATEO BOTERO UPEGUI",
      "fecha_vencimiento": "2026-03-29",
      "total": 150000,
      "sucursal_codigo": "1",
      "celular": "3147284680",
      "correo": "mateobu2@hotmail.com",
      "diasRestantes": 2
    }
  ]
}
```

### GET /api/ingresos
**Query params:** `?desde=2026-03-01&hasta=2026-03-31&sede=1`  
**Respuesta:**
```json
{
  "periodo": {"desde": "2026-03-01", "hasta": "2026-03-31"},
  "total": 125000000,
  "porDia": [
    {"fecha": "2026-03-01", "valor": 4200000},
    {"fecha": "2026-03-02", "valor": 3800000}
  ],
  "porSucursal": [
    {"sucursal": "1", "nombre": "Poblado", "valor": 75000000},
    {"sucursal": "2", "nombre": "Amsterdam", "valor": 50000000}
  ],
  "topVendedores": [
    {"vendedor": "Juan Pérez", "valor": 25000000, "ventas": 45}
  ]
}
```

---

## 🎨 Componentes UI - Especificación

### Card.js
```jsx
<Card 
  title="Clientes Activos"
  value={980}
  trend={{ value: 12, label: "vs mes anterior" }}
  icon="users"
  color="primary"
/>
```

### Table.js
```jsx
<Table
  columns={[
    { key: 'nombre', label: 'Cliente', sortable: true },
    { key: 'estado', label: 'Estado', badge: true },
    { key: 'vencimiento', label: 'Vencimiento', format: 'date' }
  ]}
  data={clientes}
  onRowClick={(row) => handleDetail(row)}
/>
```

### Badge.js
```jsx
<Badge variant="success">Con plan vigente</Badge>
<Badge variant="warning">Sin plan vigente</Badge>
<Badge variant="danger">Por vencer (2 días)</Badge>
```

---

## 🚀 Deploy en Vercel

1. **Configurar variables en Vercel:**
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`

2. **Build command:** `npm run build`
3. **Output directory:** `.next`

---

## 📝 Notas Importantes

1. **Solo datos de Power Club** - No incluir Shopify ni otras fuentes
2. **Supabase es la fuente única** - Los datos ya vienen de GSW API
3. **Timezone Colombia** - Todas las fechas en `America/Bogota`
4. **Moneda COP** - Formato `$ 125.000`
5. **Responsive** - Mobile-first, adaptable a tablet/desktop

---

## ✅ Checklist Inicial

- [ ] Crear estructura de carpetas
- [ ] Migrar a App Router
- [ ] Configurar Supabase client
- [ ] Crear layout base (Header + Sidebar)
- [ ] Implementar API /dashboard
- [ ] Implementar página Home con KPIs
- [ ] Testear deploy en Vercel

---

*Documento creado: 2026-03-27*  
*Autor: Sofia (PWR:AI - solversclaw)*
