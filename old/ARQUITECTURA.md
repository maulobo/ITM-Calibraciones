# 🎨 Arquitectura del Frontend - ITM Calibraciones

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 13** | Framework React con SSR/SSG |
| **React 18** | Librería UI |
| **TypeScript** | Tipado estático |
| **Chakra UI** | Componentes UI |
| **Tailwind CSS** | Estilos utilitarios |
| **Zustand** | Estado global |
| **React Query** | Manejo de datos/cache |
| **Axios** | Cliente HTTP |
| **React Hook Form + Yup** | Formularios y validación |
| **TanStack Table** | Tablas avanzadas |
| **jsPDF / html2canvas** | Generación de PDFs |
| **Papaparse / xlsx** | Import/Export CSV/Excel |
| **react-pdf** | Visualización de PDFs |

---

## 📁 Estructura del Proyecto

```
src/
├── api/                    # Llamadas al backend
│   ├── index.ts           # Configuración de Axios
│   ├── auth.api.ts        # Login, registro, usuarios
│   ├── instruments.api.ts # CRUD instrumentos
│   ├── certificate.api.ts # CRUD certificados
│   ├── client.api.ts      # Gestión de clientes
│   ├── office.api.ts      # Gestión de sucursales
│   ├── brand.api.ts       # Marcas
│   ├── models.api.ts      # Modelos
│   ├── city.api.ts        # Ciudades y provincias
│   ├── instruments-types.api.ts  # Tipos de instrumentos
│   ├── badgets.api.ts     # Presupuestos
│   ├── technical-inform.ts # Informes técnicos
│   ├── pdf-generator.ts   # Descarga de PDFs
│   ├── profile.api.ts     # Perfil de usuario
│   ├── query/             # React Query hooks
│   └── types/             # Interfaces TypeScript
│
├── pages/                  # Rutas Next.js
│   ├── index.tsx          # Login
│   ├── _app.tsx           # App wrapper
│   ├── 401.tsx            # Error no autorizado
│   ├── 404.tsx            # Error no encontrado
│   ├── client/            # Dashboard cliente
│   ├── technical/         # Dashboard técnico/admin
│   ├── instrument/        # Detalle/nuevo instrumento
│   ├── certificates/      # Lista de certificados
│   ├── badgets/           # Presupuestos
│   ├── costumers/         # Gestión de clientes
│   └── user/              # Gestión de usuarios
│
├── components/             # Componentes reutilizables
│   ├── Layout.tsx         # Layout principal
│   ├── Navbar.tsx         # Navegación
│   ├── DataTable.tsx      # Tabla de datos
│   ├── Forms/             # Formularios
│   ├── Modals/            # Modales
│   ├── Button.tsx         # Botón personalizado
│   ├── Statics.tsx        # Estadísticas
│   ├── instrumentBadge.tsx # Badge de estado
│   └── ...
│
├── store/                  # Zustand store
│   └── index.ts           # Estado global
│
├── hooks/                  # Hooks personalizados
│   └── userRoleHook.ts    # Hook para rol de usuario
│
├── routes/                 # Configuración de rutas
│   ├── routeNames.const.ts # Nombres de rutas
│   └── withAuth.tsx       # HOC de autenticación
│
├── const/                  # Constantes
│   ├── userRoles.const.ts # Roles de usuario
│   └── equipmentState.const.ts # Estados de equipos
│
├── commons/                # Utilidades
└── styles/                 # Estilos globales
```

---

## 🔐 Sistema de Autenticación

### Roles de Usuario

```typescript
enum UserRolesEnum {
  CLIENT = 'USER',       // Usuario cliente (ve sus instrumentos)
  TECHNICAL = 'TECHNICAL', // Técnico (gestiona todo)
  ADMIN = 'ADMIN'        // Administrador (gestiona todo + usuarios)
}
```

### Flujo de Autenticación

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │────▶│   Zustand    │────▶│  Redirect    │
│  (index.tsx) │     │ (token+user) │     │  por rol     │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                     ┌───────────────────────────┼───────────────────────────┐
                     ▼                           ▼                           ▼
              ┌──────────────┐           ┌──────────────┐           ┌──────────────┐
              │   /client    │           │  /technical  │           │  /technical  │
              │  (CLIENTE)   │           │ (TECHNICAL)  │           │   (ADMIN)    │
              └──────────────┘           └──────────────┘           └──────────────┘
```

### Protección de Rutas (withAuth)

```typescript
// Cada página protegida usa el HOC withAuth
export default withAuth(LandingPage, [UserRolesEnum.TECHNICAL, UserRolesEnum.ADMIN]);
```

---

## 🗄️ Estado Global (Zustand)

### Store Principal

```typescript
type Store = {
  // Autenticación
  authUser: IUser | null;
  userRoles: UserRolesEnum | null;
  isLoggedIn: boolean;
  token: string | null;
  
  // Refetch flags (para actualizar listas)
  refechTechnicalInform: boolean | null;
  refechUserList: boolean | null;
  refechInstrumentList: boolean | null;
  refetch: boolean | null;
  
  // Setters
  setToken: (token: string | null) => void;
  setAuthUser: (authUser: IUser | null) => void;
  // ... más setters
  
  reset: () => void; // Logout
};
```

**Persistencia:** SessionStorage (key: `itm-storage`)

---

## 🔌 Integración con Backend (API)

### Configuración Base

```typescript
// src/api/index.ts
const API_URL = process.env.NEXT_PUBLIC_URL_API; // https://api.itmcalibraciones.com

// Cliente autenticado (con token JWT)
export const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Interceptor: agrega token a cada request
authApi.interceptors.request.use((request) => {
  const token = useStore.getState().token;
  request.headers.set('Authorization', `Bearer ${token}`);
  return request;
});
```

### Mapeo de Endpoints

| Módulo | Método | Endpoint Backend | Función Frontend |
|--------|--------|-----------------|------------------|
| **Auth** | POST | `/auth/login` | `LoginUserAPI()` |
| **Auth** | POST | `/users/singup` | `AddUser()` |
| **Auth** | PATCH | `/users` | `UpdateUser()` |
| **Auth** | GET | `/users` | `GetUsers()` |
| **Auth** | GET | `/users/admins` | `GetAdminTechUsersAPI()` |
| **Profile** | GET | `/users/me` | `getUserProfile()` |
| **Profile** | PATCH | `/users/me` | `UpdateUserProfile()` |
| **Instruments** | GET | `/instruments/` | `GetInstruments()` |
| **Instruments** | POST | `/instruments/` | `AddInstrument()` |
| **Instruments** | PATCH | `/instruments/` | `UpdateInstrument()` |
| **Instruments** | PATCH | `/instruments/received` | `UpdateInstrumentReceivedStatus()` |
| **Certificates** | GET | `/certificate/` | `GetCertificates()` |
| **Certificates** | POST | `/certificate/` | `AddCertificate()` (FormData + file) |
| **Certificates** | POST | `/certificate/delete` | `DeleteCertificate()` |
| **Clients** | GET | `/clients/all` | `GetAllClients()` |
| **Clients** | POST | `/clients/add-or-update` | `AddClient()` |
| **Offices** | GET | `/offices/all` | `GetOfficesByClient()` |
| **Offices** | POST | `/offices/add-or-update` | `AddOffice()` |
| **Brands** | GET | `/brands/` | `GetBrands()` |
| **Brands** | POST | `/brands/` | `AddBrand()` |
| **Models** | GET | `/models/` | `GetModels()` |
| **Models** | POST | `/models/` | `AddModel()` |
| **Types** | GET | `/equipment-types/` | `GetInstrumentsTypes()` |
| **Types** | POST | `/equipment-types/` | `AddInstrumentType()` |
| **Cities** | GET | `/city/state/:id` | `GetCities()` |
| **Cities** | GET | `/city/all-states` | `GetAllStates()` |
| **Cities** | POST | `/city` | `AddCity()` |
| **Badgets** | GET | `/badgets/` | `GetBadgets()` |
| **Badgets** | POST | `/badgets/` | `AddBadget()` |
| **PDF** | GET | `/pdf-generator/technical-inform/:id` | `GetPDFTechnicalInform()` |
| **PDF** | GET | `/pdf-generator/sticker/:id` | `GetPDFSticker()` |
| **PDF** | GET | `/pdf-generator/badget/:id` | `GetPDFBadget()` |
| **Technical** | GET | `/technical-inform/` | `GetTechnicalInform()` |
| **Technical** | POST | `/technical-inform/` | `AddTechnicalInform()` |

---

## 📊 Estados de Instrumentos

```typescript
enum EquipmentStateEnum {
  CALIBRATED = 'Calibrado',        // ✅ Verde
  SOON_EXPIRED = 'Pronto a vencer', // ⚠️ Amarillo
  EXPIRED = 'Vencido',              // ❌ Rojo
  IN_PROCESS = 'Enviado a calibrar', // 🔵 Azul
  OUT_OF_SERFVICE = 'Fuera de servicio' // ⛔ Rojo
}
```

---

## 🗺️ Rutas de la Aplicación

| Ruta | Componente | Roles Permitidos | Descripción |
|------|------------|------------------|-------------|
| `/` | `LoginPage` | Público | Login |
| `/client` | `client/index.tsx` | CLIENT | Dashboard cliente |
| `/technical` | `technical/index.tsx` | TECHNICAL, ADMIN | Dashboard técnico |
| `/instrument` | `instrument/index.tsx` | Todos auth | Detalle instrumento |
| `/instrument/new` | `instrument/new.tsx` | TECHNICAL, ADMIN | Crear/editar instrumento |
| `/certificates` | `certificates/index.tsx` | TECHNICAL, ADMIN | Lista certificados |
| `/badgets` | `badgets/index.tsx` | TECHNICAL, ADMIN | Lista presupuestos |
| `/badgets/new` | `badgets/new.tsx` | TECHNICAL, ADMIN | Crear presupuesto |
| `/costumers` | `costumers/index.tsx` | TECHNICAL, ADMIN | Lista clientes |
| `/user` | `user/index.tsx` | TECHNICAL, ADMIN | Lista usuarios |
| `/user/new` | `user/new.tsx` | TECHNICAL, ADMIN | Crear usuario |
| `/user/profile` | `user/profile.tsx` | Todos auth | Mi perfil |

---

## 🖥️ Vistas Principales

### 1. Dashboard Técnico (`/technical`)

**Funcionalidades:**
- ✅ Ver TODOS los instrumentos (de todos los clientes)
- ✅ Filtrar por: cliente, estado, tipo, número de serie
- ✅ Subir certificados (modal)
- ✅ Descargar certificados
- ✅ Marcar instrumento como "recibido" (toggle)
- ✅ Ver ficha técnica del instrumento
- ✅ Estadísticas (gráficos)
- ✅ Navegación a: Usuarios, Certificados, Presupuestos, Clientes

### 2. Dashboard Cliente (`/client`)

**Funcionalidades:**
- ✅ Ver SUS instrumentos (solo los de su sucursal)
- ✅ Filtrar por: estado, tipo, número de serie, vencimiento
- ✅ Descargar certificados
- ✅ Editar campos: Identificador, N/S alternativo
- ✅ Exportar a CSV/Excel
- ✅ Estadísticas de sus instrumentos
- ✅ Gráfico de vencimientos por mes

### 3. Detalle Instrumento (`/instrument?id=xxx`)

**Funcionalidades:**
- Ver información completa del instrumento
- Historial de certificados
- Informes técnicos
- Descargar sticker/badge

---

## 📦 Componentes Clave

| Componente | Descripción |
|------------|-------------|
| `DataTable` | Tabla con TanStack Table, columnas editables, ordenamiento |
| `WrapperDataTable` | Wrapper con scroll y estilos |
| `Statics` | Gráficos de estadísticas (Recharts) |
| `ExpiredMonthlyInstruments` | Gráfico de vencimientos por mes |
| `instrumentBadge` | Badge de estado (Calibrado, Vencido, etc.) |
| `CreateOrUpdateCertificateModal` | Modal para subir certificados |
| `LoginForm` | Formulario de login |
| `RecoverPasswordForm` | Recuperar contraseña |
| `Layout` | Layout principal con navbar |
| `Navbar` | Navegación superior |
| `ButtonDowloadCertificate` | Botón para descargar certificado |
| `ButtonDowloadSticker` | Botón para descargar sticker |
| `ButtonDowloadTechnicaInform` | Botón para descargar informe técnico |

---

## ⚙️ Configuración

### Variables de Entorno

```bash
# .env (producción)
NEXT_PUBLIC_URL_API = https://api.itmcalibraciones.com

# .env.local (desarrollo)
NEXT_PUBLIC_URL_API = http://localhost:4000
```

### Scripts

```bash
npm run dev      # Desarrollo (localhost:3000)
npm run build    # Build producción
npm run start    # Servidor producción
npm run lint     # Linting
npm run export   # Export estático
```

---

## 🔄 Flujos de Negocio (Frontend)

### Flujo: Subir Certificado

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Técnico    │────▶│    Modal     │────▶│   FormData   │
│ click "↑"    │     │  selecciona  │     │  + archivo   │
│              │     │    PDF       │     │   PDF        │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ POST /cert   │
                                          │ (multipart)  │
                                          └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Refetch     │
                                          │  lista       │
                                          └──────────────┘
```

### Flujo: Ver Instrumentos (Cliente)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Login     │────▶│   Zustand    │────▶│  /client     │
│   (USER)     │     │  guarda rol  │     │  redirect    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ GET /instrum │
                                          │ (con token)  │
                                          └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │ Backend      │
                                          │ filtra por   │
                                          │ office       │
                                          └──────────────┘
                                                 │
                                                 ▼
                                          ┌──────────────┐
                                          │  Muestra     │
                                          │  DataTable   │
                                          └──────────────┘
```

---

## 🚀 Comandos para Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo (requiere backend en localhost:4000)
npm run dev

# Build
npm run build

# Producción
npm run start
```

### Para desarrollo local completo:

1. Levantar MongoDB
2. Levantar backend (`npm run start:dev` en puerto 4000)
3. Crear `.env.local` con `NEXT_PUBLIC_URL_API=http://localhost:4000`
4. Levantar frontend (`npm run dev` en puerto 3000)

---

## 📝 Notas Importantes

1. **CORS**: El backend solo acepta requests de `app.itmcalibraciones.com`. Para desarrollo local, modificar `main.ts` del backend.

2. **Autenticación**: El token JWT se guarda en Zustand (SessionStorage). Si cierras la pestaña, debes volver a loguearte.

3. **Roles**: El backend determina qué instrumentos puede ver cada usuario según su `office`. El frontend solo filtra visualmente.

4. **PDFs**: Los certificados se almacenan en S3 y se descargan directamente desde ahí.

5. **Exportación**: El cliente puede exportar su lista de instrumentos a CSV/Excel (solo frontend, no pasa por backend).
