# 🔍 AUDIT.md - Auditoría Completa del Dashboard PWR Club

**Fecha:** 2026-03-29  
**Auditor:** Silvana (SolversAI)  
**Proyecto:** pwr-dashboard-test  
**Repo:** github.com/pwrecosystem/pwr-dashboard-test

---

## 1. 📦 Estado Actual — Qué Hay Implementado

### Stack
- Next.js 14 (App Router) + React 18 + Supabase JS v2 + Tailwind CSS 3.4
- Deploy target: Vercel

### Archivos del Proyecto (26 archivos fuente)

| Categoría | Archivo | Estado |
|-----------|---------|--------|
| **Config** | `package.json` | ✅ Correcto |
| **Config** | `next.config.js` | ✅ Básico (solo images) |
| **Config** | `tailwind.config.js` | ⚠️ Falta incluir `api/` en content |
| **Config** | `postcss.config.js` | ✅ OK |
| **Config** | `vercel.json` | ✅ OK |
| **Config** | `.env.local` | ❌ **NO EXISTE** — crítico |
| **Lib** | `lib/supabase.js` | ⚠️ Fallback URL hardcodeada |
| **Lib** | `lib/utils.js` | ✅ Bien (formatCurrency, formatDate, daysUntil, etc.) |
| **Layout** | `app/layout.js` | ⚠️ No incluye Sidebar (se repite en cada página) |
| **Layout** | `app/globals.css` | ✅ OK — CSS vars + Tailwind |
| **Layout** | `components/layout/Header.js` | ✅ OK — Logo externo + título |
| **Layout** | `components/layout/Sidebar.js` | ✅ OK — Navegación con active state |
| **UI** | `components/ui/Card.js` | ⚠️ Pobre diferenciación visual (3 de 4 colores = mismo borde negro) |
| **UI** | `components/ui/Badge.js` | ⚠️ Success y Warning lucen casi idénticos |
| **UI** | `components/ui/Loading.js` | ✅ OK |
| **Páginas** | `app/page.js` (Home) | ✅ Implementada — KPIs + vencimientos + sucursales |
| **Páginas** | `app/clientes/page.js` | ✅ Implementada — Tabla + filtros + búsqueda |
| **Páginas** | `app/vencimientos/page.js` | ✅ Implementada — Tabla + filtro por días |
| **Páginas** | `app/ingresos/page.js` | ✅ Implementada — Total + por sucursal + top vendedores |
| **Páginas** | `app/sucursales/page.js` | ✅ Implementada — Cards con KPIs por sede |
| **API** | `api/dashboard/route.js` | ✅ KPIs generales |
| **API** | `api/clientes/route.js` | ✅ Listado con filtros |
| **API** | `api/vencimientos/route.js` | ✅ Planes por vencer |
| **API** | `api/ingresos/route.js` | ✅ Ingresos por periodo |
| **API** | `api/sucursales/route.js` | ✅ Datos por sede |
| **Static** | `public/index.html` | ⚠️ Página estática con datos hardcodeados de marzo 2026 (84 clientes) |
| **Script** | `scripts/check-schema.js` | ✅ Útil para debug, pero requiere .env.local |

### Resumen de Implementación
- **5/5 páginas** creadas (Home, Clientes, Vencimientos, Ingresos, Sucursales)
- **5/5 API routes** creadas
- **5/5 componentes UI** creados (Card, Badge, Loading, Header, Sidebar)
- **0/0 gráficas** implementadas (no hay chart library)

---

## 2. 🗄️ Schema Supabase — Estado Real

### ⚠️ CRÍTICO: Supabase Inaccesible

```
Host: nfdffurucafdrjuhqeqs.supabase.co
DNS Status: NXDOMAIN — No resuelve
Verificado con: nslookup (8.8.8.8), dig, curl, web_fetch
```

**El proyecto Supabase NO existe o fue eliminado.** El project ref `nfdffurucafdrjuhqeqs` no tiene DNS. Esto significa:
1. El dashboard **no puede funcionar** en producción
2. No se pueden verificar tablas, columnas ni datos reales
3. Se requiere crear/recrear el proyecto Supabase

### Tablas Esperadas (según PLAN.md y código)

| Tabla | Campos usados en código | Verificado |
|-------|------------------------|------------|
| `clientes` | identificacion, nombre_completo, celular, correo_electronico, estado, estado_cliente, sucursal, fecha_ingreso | ❌ No verificable |
| `facturas` | id, identificacion_cliente, nombre_cliente, fecha_vencimiento, total, sucursal_codigo, estado_anulada | ❌ No verificable |
| `ingresos` | id, fecha, valor, sucursal, vendedor | ❌ No verificable |
| `sucursales` | (no se usa directamente — sucursales se derivan de clientes) | ❌ No verificable |
| `cortesias` | (mencionada en PLAN.md pero NO usada en código) | ❌ No verificable |

### Datos Disponibles (del HTML estático)
El archivo `public/index.html` contiene datos hardcodeados de 84 clientes sin plan activo con facturas vencidas en marzo 2026. Todos con sucursal_codigo "15" (no hay sedes 1-3 como indica el código). Esto sugiere que la estructura de datos real puede diferir de lo asumido.

---

## 3. 📊 Gap Analysis — Plan vs Realidad

### Fase 1: Configuración Base
| Tarea | Estado | Notas |
|-------|--------|-------|
| Migrar a App Router | ✅ | App Router usado correctamente |
| Configurar cliente Supabase | ⚠️ | Código existe pero no hay .env.local ni Supabase activo |
| Crear .env.local | ❌ | **No existe** |
| Layout con Sidebar | ⚠️ | Sidebar no está en layout.js, se repite en cada página |

### Fase 2: API Routes
| Tarea | Estado | Notas |
|-------|--------|-------|
| GET /api/dashboard | ✅ | Implementado completo |
| GET /api/clientes | ✅ | Con filtros de sede, estado, búsqueda |
| GET /api/vencimientos | ✅ | Con filtro por días y sede |
| GET /api/ingresos | ✅ | Con filtro por fecha y sede |
| GET /api/sucursales | ✅ | Con clientes y ingresos por sede |

### Fase 3: Frontend — Home
| Tarea | Estado | Notas |
|-------|--------|-------|
| Header con logo | ✅ | Usando imagen externa de powerclub.com.co |
| Sidebar navegación | ✅ | Funcional con active state |
| KPICards | ✅ | 4 cards: activos, con plan, sin plan, ingreso mes |
| Gráfica ingresos 30 días | ❌ | **No implementada** — no hay chart library |
| Lista vencimientos 7 días | ✅ | Top 5 en tabla |

### Fase 4: Frontend — Clientes
| Tarea | Estado | Notas |
|-------|--------|-------|
| Tabla listado | ✅ | Implementada |
| Búsqueda nombre/ID | ✅ | Funcional (aunque ineficiente) |
| Filtros sede/estado | ✅ | Dropdowns implementados |
| Filtro tipo de plan | ❌ | No implementado |
| Badge de estado | ✅ | Con plan / Sin plan |
| Exportar CSV | ❌ | **No implementado** |

### Fase 5: Frontend — Vencimientos
| Tarea | Estado | Notas |
|-------|--------|-------|
| Tabla vencimientos | ✅ | Con datos de contacto |
| Alertas visuales | ✅ | Rojo <3 días, amarillo <7 días |
| Filtro por rango fechas | ⚠️ | Solo por "próximos X días" (7/15/30), no rango libre |
| Acciones rápidas (email, WhatsApp) | ❌ | **No implementado** |

### Fase 6: Frontend — Ingresos
| Tarea | Estado | Notas |
|-------|--------|-------|
| Gráfica diaria/semanal/mensual | ❌ | **No implementada** — solo tabla |
| Desglose por sucursal | ✅ | Lista implementada |
| Top vendedores | ✅ | Top 5 con ranking visual |
| Comparativa mes vs anterior | ⚠️ | Solo en KPI del home (variación %) |

### Fase 7: Frontend — Sucursales
| Tarea | Estado | Notas |
|-------|--------|-------|
| Comparativo entre sedes | ✅ | Cards con progress bars |
| KPIs por sucursal | ✅ | Clientes, activos, ingresos |
| Mapa o lista ubicaciones | ❌ | **No implementado** |

### Componentes Faltantes del PLAN
| Componente | Estado |
|------------|--------|
| `components/ui/Table.js` (reutilizable) | ❌ Cada página tiene su propia tabla inline |
| `components/dashboard/KPICards.js` | ❌ KPIs inline en page.js |
| `components/dashboard/RevenueChart.js` | ❌ No existe |
| `components/dashboard/ExpiringPlans.js` | ❌ Inline en page.js |
| `api/clientes/[id]/route.js` (detalle) | ❌ No existe |

---

## 4. 🐛 Bugs y Problemas Encontrados

### CRÍTICOS

1. **🔴 Supabase NO existe** — El host `nfdffurucafdrjuhqeqs.supabase.co` no resuelve DNS. El dashboard no puede funcionar. Se necesita crear un nuevo proyecto o verificar el project ref correcto.

2. **🔴 No hay `.env.local`** — Sin este archivo, `supabase.js` crea un cliente con `undefined` como key, lo que causa errores en runtime.

3. **🔴 API routes fuera de `app/`** — Los archivos están en `/api/` (raíz) en vez de `/app/api/`. En Next.js App Router, las API routes deben estar en `app/api/*/route.js` para funcionar. **Las APIs actuales NO se ejecutarían en producción.**

### IMPORTANTES

4. **🟡 Sidebar repetido en cada página** — En vez de estar en `layout.js`, se importa manualmente en cada `page.js`. Esto causa re-renders innecesarios y código duplicado.

5. **🟡 Búsqueda de clientes ineficiente** — Hace 2 queries separadas: primero busca IDs por nombre, luego filtra por esos IDs. En datasets grandes esto es lento. Debería usar un solo `or()` filter.

6. **🟡 Nombres de sucursales hardcodeados** — Aparecen hardcodeados en 4 archivos diferentes (`dashboard/route.js`, `ingresos/route.js`, `sucursales/route.js`, y los selects del frontend). Si se agrega una sede, hay que editarlos todos.

7. **🟡 public/index.html con datos estáticos** — Contiene 84 registros hardcodeados que se volverán obsoletos. Además, Next.js sirve `public/index.html` en `/index.html` lo cual puede causar conflicto con la app.

8. **🟡 Badge sin diferenciación visual** — `success` y `warning` tienen el mismo estilo visual (borde negro, fondo blanco). Solo `danger` es realmente distinto (rojo).

9. **🟡 Card colores redundantes** — 3 de 4 variantes (`success`, `warning`, `info`) tienen `border-pwr-black`. Solo `primary` tiene borde rojo. No hay diferenciación visual real.

10. **🟡 Sin paginación en clientes** — Límite de 100 hardcodeado. Con miles de clientes, esto será insuficiente y no hay forma de navegar páginas.

### MENORES

11. **🟢 Logo cargado desde CDN externo** — `powerclub.com.co` podría caer o cambiar la URL. Mejor tener el logo local.

12. **🟢 No hay error handling visible al usuario** — Si un API falla, solo se logea en consola. No hay toasts, banners o mensajes de error.

13. **🟢 No hay font Montserrat importada** — `globals.css` declara Montserrat como fuente pero no la importa (no hay `@import` ni `<link>`). Solo funcionará en máquinas que la tengan instalada.

14. **🟢 Sucursal "15" en datos reales** — El HTML estático muestra sede "15", pero el código solo maneja sedes 1, 2, 3 (Poblado, Amsterdam, Saboleta). Discrepancia con datos reales.

15. **🟢 `static.json`** — Archivo `{"framework": null}` parece residuo de Heroku/static deployment anterior. Innecesario.

---

## 5. 💡 Mejoras Propuestas

### UX
1. **Agregar gráficas** — Instalar `recharts` o `chart.js` para gráficas de ingresos, tendencias, etc.
2. **Paginación** — Implementar paginación server-side en tabla de clientes.
3. **Dark mode / Branding consistency** — Los badges y cards necesitan mejor diferenciación de colores.
4. **Acciones rápidas** — Botones de WhatsApp (`wa.me/{celular}`) y mailto links en vencimientos.
5. **Export CSV** — Botón para descargar datos de clientes/vencimientos.
6. **Responsive** — Sidebar debería colapsar en mobile (hamburger menu).
7. **Loading skeletons** — En vez de spinner, usar skeleton screens para mejor UX.
8. **Error states** — Mostrar mensajes amigables cuando APIs fallen.
9. **Empty states** — Mensajes más informativos cuando no hay datos.

### Performance
1. **Mover Sidebar al layout** — Evita re-renders en cada navegación.
2. **Server Components** — Las páginas podrían ser Server Components que hacen fetch directo a Supabase sin pasar por API routes (eliminando un hop).
3. **React Query / SWR** — Para caching, revalidación, y estados de loading/error automáticos.
4. **Supabase Realtime** — Para actualizaciones en vivo del dashboard.
5. **API: Evitar `select('*')`** — Solo seleccionar campos necesarios para reducir payload.

### Código
1. **Extraer nombres de sucursales a un config** — Un solo archivo `lib/constants.js` con el mapeo de sucursales.
2. **Componente Table reutilizable** — En vez de tablas inline repetidas en 3 páginas.
3. **Mover API routes a `app/api/`** — Requisito para App Router.
4. **TypeScript** — Migrar para type safety (opcional pero recomendado).
5. **Componentes modulares del dashboard** — Extraer KPIs y listas a componentes separados.
6. **Importar Montserrat** — Usar `next/font/google` para optimización automática.

---

## 6. 🎯 Plan de Ejecución Priorizado

### 🔥 Sprint 1: Infraestructura Crítica (Blocker)
**Sin esto, nada funciona.**

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 1.1 | **Verificar/crear proyecto Supabase** — Confirmar el project ref correcto o crear nuevo proyecto. Migrar tablas si es necesario. | Alto | 🔴 Blocker |
| 1.2 | **Crear `.env.local`** con SUPABASE_URL y SUPABASE_SERVICE_KEY correctos | 5 min | 🔴 Blocker |
| 1.3 | **Mover `/api/` → `/app/api/`** — Las API routes no funcionan fuera de `app/` en App Router | 15 min | 🔴 Blocker |
| 1.4 | **Verificar schema real** — Ejecutar `scripts/check-schema.js` contra Supabase real para mapear tablas/columnas | 15 min | 🔴 Blocker |

### ⚡ Sprint 2: Fixes Rápidos (Quick Wins)
**Mejoras que toman minutos pero tienen gran impacto.**

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 2.1 | **Sidebar en layout.js** — Mover de páginas individuales al layout compartido | 15 min | 🟡 Alto |
| 2.2 | **Importar Montserrat** con `next/font/google` | 5 min | 🟡 Medio |
| 2.3 | **Mejorar colores de Badge** — Verde para success, amarillo para warning, etc. | 10 min | 🟡 Medio |
| 2.4 | **Mejorar colores de Card** — Bordes de color distinto por variante | 10 min | 🟡 Medio |
| 2.5 | **Extraer constantes de sucursales** a `lib/constants.js` | 10 min | 🟢 Bajo |
| 2.6 | **Eliminar `public/index.html`** (datos estáticos obsoletos) y `static.json` | 2 min | 🟢 Bajo |

### 📊 Sprint 3: Funcionalidades Faltantes (Core Features)
**Lo que el plan pide y aún no existe.**

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 3.1 | **Instalar recharts** + Gráfica de ingresos en Home (últimos 30 días) | 1-2h | 🟡 Alto |
| 3.2 | **Gráfica de ingresos** diaria/semanal/mensual en página Ingresos | 1-2h | 🟡 Alto |
| 3.3 | **Paginación server-side** en clientes | 1h | 🟡 Alto |
| 3.4 | **Export CSV** en clientes y vencimientos | 45 min | 🟡 Medio |
| 3.5 | **Acciones rápidas** en vencimientos (WhatsApp link, mailto) | 30 min | 🟡 Medio |
| 3.6 | **Filtro rango de fechas** libre en vencimientos | 30 min | 🟡 Medio |
| 3.7 | **Comparativa mes actual vs anterior** en página de ingresos | 1h | 🟡 Medio |

### 🛠️ Sprint 4: Calidad y Polish
**Mejoras que hacen el dashboard profesional.**

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 4.1 | **Componente Table reutilizable** con sorting, headers, etc. | 2h | 🟢 Medio |
| 4.2 | **Error handling visible** — Toast/banner cuando APIs fallan | 1h | 🟢 Medio |
| 4.3 | **Loading skeletons** en vez de spinners | 1h | 🟢 Bajo |
| 4.4 | **Responsive sidebar** — Hamburger menu en mobile | 1h | 🟢 Medio |
| 4.5 | **Logo local** — Descargar y servir desde `/public/` | 10 min | 🟢 Bajo |
| 4.6 | **Optimizar búsqueda de clientes** — Un solo query con `.or()` | 20 min | 🟢 Bajo |

### 🚀 Sprint 5: Avanzado (Nice-to-have)
**Para cuando todo lo anterior esté listo.**

| # | Tarea | Esfuerzo | Impacto |
|---|-------|----------|---------|
| 5.1 | **Server Components** — Páginas que no necesitan interactividad como Server Components | 2-3h | 🟢 Medio |
| 5.2 | **React Query / SWR** para caching inteligente | 2h | 🟢 Medio |
| 5.3 | **Detalle de cliente** (`/clientes/[id]`) | 2h | 🟢 Medio |
| 5.4 | **Módulo cortesías** (mencionado en PLAN pero no implementado) | 3-4h | 🟢 Bajo |
| 5.5 | **Supabase Realtime** para datos en vivo | 2h | 🟢 Bajo |

---

## 7. 📋 Resumen Ejecutivo

### Lo Bueno ✅
- Estructura de proyecto bien organizada
- Todas las páginas planeadas existen con UI funcional
- APIs cubren todos los endpoints necesarios
- Branding PWR Club aplicado (colores, logo)
- Filtros y búsqueda implementados
- Código limpio y legible
- Utils bien estructurados

### Lo Crítico 🔴
- **Supabase inaccesible** — El proyecto no existe en DNS
- **No hay `.env.local`** — Las APIs no pueden conectar
- **API routes en ubicación incorrecta** — No funcionan en App Router
- **Resultado: El dashboard actualmente NO funciona**

### Lo Que Falta 🟡
- Gráficas (0 implementadas, ~3 planeadas)
- Export CSV
- Paginación
- Acciones rápidas (WhatsApp/email)
- Componentes reutilizables (Table)
- Módulo cortesías

### Estimación Total para Completar
- **Sprint 1 (blocker):** ~2-4 horas (depende de Supabase)
- **Sprint 2 (quick wins):** ~1 hora
- **Sprint 3 (features):** ~6-8 horas
- **Sprint 4 (polish):** ~5-6 horas
- **Sprint 5 (avanzado):** ~10-12 horas
- **Total estimado:** ~24-30 horas de desarrollo

---

*Generado automáticamente por Silvana — 2026-03-29 22:30 COT*
