# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: ZOVITA

SaaS veterinario multi-tenant. La plataforma se muestra como **ZOVITA** (patrón JSX: `Zo<span>VITA</span>`). Superadmin: `root@zovita.cl`.

## Dev Commands

```bash
# Backend (puerto 3001)
cd backend && npm run dev

# Frontend (puerto 5173)
cd frontend && npm run dev

# Si el puerto 3001 está ocupado
lsof -ti :3001 | xargs kill -9
```

Backend requiere `backend/.env` con: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, `FRONTEND_URL`.

## Architecture

### Stack
- **Frontend:** React 18 + Vite, sin router externo (navegación por estado)
- **Backend:** Express ESM (`"type": "module"`) corriendo en Vercel Serverless
- **Base de datos:** Supabase (PostgreSQL) con fallback a `localStore` en memoria si `USE_LOCAL=true` o sin `SUPABASE_URL`
- **Auth:** JWT propio (no Supabase Auth). Token en `localStorage` como `moga_token`

### Multi-tenancy
Cada clínica tiene un `tenantId`. Todos los modelos del backend filtran por `tenantId` extraído del JWT. Superadmin tiene `tenantId: null` y ve todos los datos.

Roles: `admin` | `staff` | `client` | `superadmin`

### Frontend — flujo de navegación
No hay React Router. `App.jsx` decide qué renderizar según `currentUser.role` y el hash de la URL:

```
/#/reservar/:tenantId  →  PublicBookView   (sin login)
role === superadmin    →  SuperAdminDashboard
role === client        →  ClientPortal
role === admin/staff   →  AdminDashboard
```

### Estado global (`AppContext`)
`useReducer` centraliza todo el estado de la app. Patrón para mutaciones:

1. Llamar al service (axios → `/api/...`)
2. Dispatch de la acción correspondiente (`ADD_*`, `UPDATE_*`, `REMOVE_*`)

Carga inicial en `loadAll()`: todos los datos en paralelo excepto `records` (fichas médicas), que se carga en background por su tamaño. Caché de 5 min en `sessionStorage` (clave `moga_cache_v2`).

### Backend — capas
```
routes/     →  define endpoints y aplica middleware de auth
controllers/ →  lógica HTTP (req/res), llama a modelos
models/      →  acceso a Supabase (o localStore si USE_LOCAL)
middleware/  →  requireAuth / requireAdmin / requireStaff
```

### API Proxy (desarrollo local)
Vite proxea `/api` → `http://localhost:3001`. En producción, `frontend/vercel.json` redirige `/api/*` al backend en Vercel.

### Rutas públicas
`/api/public/*` no requiere auth. Usadas por `PublicBookView` para reservas online sin cuenta. El cliente puede ser invitado (se guardan datos sin `userId`).

## Key Files

| Archivo | Rol |
|---|---|
| `frontend/src/context/AppContext.jsx` | Estado global, caché, todas las mutaciones |
| `frontend/src/services/api.js` | Instancia axios con JWT interceptor |
| `backend/src/app.js` | Entry point Express, registra todas las rutas |
| `backend/src/middleware/auth.js` | requireAuth / requireAdmin / requireStaff |
| `backend/src/config/supabase.js` | Cliente Supabase singleton |
