# 🏗️ Arquitectura del Backend - ITM Calibraciones

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **NestJS 9** | Framework backend (TypeScript) |
| **MongoDB + Mongoose** | Base de datos NoSQL |
| **JWT + Passport** | Autenticación |
| **AWS S3** | Almacenamiento de imágenes/PDFs |
| **AWS SES** | Envío de emails |
| **Swagger** | Documentación API |
| **Docker** | Containerización |

---

## 📁 Estructura de Módulos

```
src/
├── auth/              # Autenticación (login, JWT, guards)
├── users/             # Gestión de usuarios
├── clients/           # Clientes (empresas)
├── offices/           # Sucursales de clientes
├── equipment/         # Instrumentos/Equipos
├── equipment-types/   # Tipos de instrumentos
├── equipment-card/    # Tarjetas de equipos
├── brands/            # Marcas de equipos
├── models/            # Modelos de equipos
├── certificates/      # Certificados de calibración
├── technical-inform/  # Informes técnicos
├── city/              # Ciudades
├── pdf-generator/     # Generación de PDFs
├── qr/                # Generación de códigos QR
├── badgets/           # Etiquetas/Badges
├── image-upload/      # Subida de imágenes a S3
├── imports/           # Importación de datos
├── email/             # Servicio de emails
└── common/            # Utilidades compartidas
```

---

## 📊 Modelo de Datos (Entidades)

### Diagrama de Relaciones

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │──1:N─│   Office    │──1:N─│    User     │
│  (Empresa)  │      │ (Sucursal)  │      │  (Usuario)  │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │
       └────────┬───────────┘
                │
                ▼ 1:N
       ┌─────────────────┐
       │    Equipment    │
       │  (Instrumento)  │
       └─────────────────┘
                │
         ┌──────┴──────┐
         ▼ N:1         ▼ 1:N
   ┌───────────┐  ┌─────────────┐
   │   Model   │  │ Certificate │
   └───────────┘  └─────────────┘
         │
         ▼ N:1
   ┌───────────┐
   │   Brand   │
   └───────────┘
```

### Entidades Principales

#### Client (Cliente/Empresa)
```typescript
{
  socialReason: string     // Razón social (único)
  cuit: string            // CUIT (único)
  responsable?: string    // Responsable
  phoneNumber?: string    // Teléfono
  adress?: string         // Dirección
  city: ObjectId          // Referencia a City
}
```

#### Office (Sucursal)
```typescript
{
  client: ObjectId        // Referencia a Client
  city: ObjectId          // Referencia a City
  name: string            // Nombre de la sucursal
  phoneNumber?: string    // Teléfono
  responsable?: string    // Responsable
  adress?: string         // Dirección
}
```

#### User (Usuario)
```typescript
{
  email: string           // Email (único)
  name: string            // Nombre
  lastName: string        // Apellido
  phoneNumber?: string    // Teléfono
  area?: string           // Área
  password: string        // Contraseña (hasheada)
  roles: UserRoles[]      // Roles [USER, ADMIN, TECHNICAL]
  lastLogin: Date         // Último login
  office: ObjectId        // Referencia a Office
}
```

#### Equipment (Instrumento/Equipo)
```typescript
{
  serialNumber: string              // Número de serie
  customSerialNumber?: string       // Número personalizado
  model: ObjectId                   // Referencia a Model
  office: ObjectId                  // Referencia a Office
  instrumentType: ObjectId          // Referencia a EquipmentTypes
  label?: string                    // Etiqueta
  range?: string                    // Rango
  description?: string              // Descripción
  state: EquipmentStateEnum         // Estado (CREATED, etc.)
  calibrationDate?: Date            // Fecha de calibración
  calibrationExpirationDate?: Date  // Fecha de vencimiento
  certificate?: string              // URL del certificado
  qr?: string                       // URL del código QR
  outOfService?: boolean            // Fuera de servicio
}
```

#### Certificate (Certificado)
```typescript
{
  equipment: ObjectId               // Referencia a Equipment
  calibrationDate: Date             // Fecha de calibración
  calibrationExpirationDate: Date   // Fecha de vencimiento
  certificate: string               // URL del PDF
  number: string                    // Número de certificado
  deleted?: boolean                 // Eliminado (soft delete)
}
```

#### Brand (Marca)
```typescript
{
  name: string            // Nombre (único)
  image?: string          // URL de imagen
}
```

#### Model (Modelo)
```typescript
{
  brand: ObjectId         // Referencia a Brand
  name: string            // Nombre del modelo
}
```

#### EquipmentTypes (Tipo de Instrumento)
```typescript
{
  type: string            // Tipo
  description?: string    // Descripción
}
```

#### TechnicalInform (Informe Técnico)
```typescript
{
  user: ObjectId          // Referencia a User (técnico)
  equipment: ObjectId     // Referencia a Equipment
  date: Date              // Fecha
  descriptions: string    // Descripción
  comments: string        // Comentarios
}
```

---

## 🔐 Sistema de Roles y Permisos

### Roles Disponibles

```typescript
enum UserRoles {
  USER = 'USER',           // Usuario básico (cliente)
  ADMIN = 'ADMIN',         // Administrador completo
  TECHNICAL = 'TECHNICAL'  // Técnico de calibración
}
```

### Matriz de Permisos

| Acción | USER | TECHNICAL | ADMIN |
|--------|:----:|:---------:|:-----:|
| Ver sus propios equipos | ✅ | ✅ | ✅ |
| Ver todos los equipos | ❌ | ✅ | ✅ |
| Crear/Editar equipos | ❌ | ✅ | ✅ |
| Subir certificados | ❌ | ✅ | ✅ |
| Gestionar clientes | ❌ | ✅ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver historial de login | ❌ | ✅ | ✅ |

---

## 🔌 API Endpoints

### Autenticación (`/auth`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| POST | `/auth/login` | Iniciar sesión | Público |
| POST | `/auth/refresh` | Refrescar token | Autenticado |

### Usuarios (`/users`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/users` | Listar usuarios | ADMIN, TECHNICAL |
| POST | `/users/singup` | Crear usuario | ADMIN, TECHNICAL |
| PATCH | `/users` | Actualizar usuario | ADMIN, TECHNICAL |
| GET | `/users/me` | Mi perfil | Autenticado |
| PATCH | `/users/me` | Actualizar mi perfil | Autenticado |
| GET | `/users/admins` | Listar admins/técnicos | ADMIN, TECHNICAL |
| GET | `/users/login-history/:id` | Historial de login | ADMIN, TECHNICAL |
| GET | `/users/:id` | Obtener usuario | ADMIN |
| GET | `/users/email/:email` | Buscar por email | ADMIN, TECHNICAL |

### Clientes (`/clients`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/clients/all` | Listar clientes | ADMIN, TECHNICAL |
| POST | `/clients/add-or-update` | Crear/Actualizar cliente | ADMIN, TECHNICAL |

### Sucursales (`/offices`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/offices/all` | Listar sucursales | Autenticado |
| POST | `/offices/add-or-update` | Crear/Actualizar sucursal | Autenticado |

### Instrumentos (`/instruments`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/instruments` | Listar instrumentos | Autenticado |
| POST | `/instruments` | Crear instrumento | Autenticado |
| PATCH | `/instruments` | Actualizar instrumento | Autenticado |
| PATCH | `/instruments/received` | Marcar como recibido | ADMIN, TECHNICAL |
| GET | `/instruments/qr/:id` | Descargar certificado por QR | Público |
| GET | `/instruments/notify-instrument-soon-expired` | Notificar vencimientos | ADMIN, TECHNICAL |

### Certificados (`/certificate`)

| Método | Endpoint | Descripción | Roles |
|--------|----------|-------------|-------|
| GET | `/certificate` | Listar certificados | Autenticado |
| POST | `/certificate` | Subir certificado (con watermark) | ADMIN, TECHNICAL |
| POST | `/certificate/delete` | Eliminar certificado | ADMIN, TECHNICAL |

---

## ⚙️ Configuración

### Variables de Entorno (`.env.dev`)

```bash
# Servidor
APP_PORT=4000
NODE_ENV=dev

# Base de datos
MONGO_URL=mongodb://localhost:27017/itm

# JWT
VERIFY_SECRET=itm@2023#:)

# URLs
FRONT_URL=http://localhost:3000
BACK_URL=http://localhost:4000

# AWS S3
ACCESS_KEY_ID=AKIA...
SECRET_ACCESS_KEY=LsKr...
AWS_S3_BUCKET=img.itmcalibraciones.com

# AWS SES (Email)
SMTP_USER=AKIA...
SMTP_PASS=BHg8...
SMTP_PORT=587
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
EMAIL_FROM=app@itmcalibraciones.com
```

---

## 🔄 Flujo de Negocio

### 1. Estructura Organizacional
```
Cliente (Empresa)
    └── Sucursal 1
    │       ├── Usuario A (cliente)
    │       ├── Usuario B (cliente)
    │       └── Instrumentos...
    └── Sucursal 2
            ├── Usuario C (cliente)
            └── Instrumentos...
```

### 2. Ciclo de Vida de un Instrumento

1. **Creación**: Se registra el instrumento con su número de serie, modelo, etc.
2. **Calibración**: Un técnico calibra el instrumento y sube el certificado
3. **QR**: Se genera un código QR que enlaza al certificado
4. **Notificación**: El sistema notifica cuando el certificado está por vencer
5. **Recalibración**: Se repite el proceso

### 3. Flujo de Certificación

```
┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│  Instrumento │───▶│  Calibración  │───▶│ Certificado  │
│   creado     │    │  por técnico  │    │   + QR       │
└──────────────┘    └───────────────┘    └──────────────┘
                                                │
                    ┌───────────────┐           │
                    │  Notificación │◀──────────┘
                    │  vencimiento  │   (próximo a vencer)
                    └───────────────┘
```

---

## 🚀 Comandos para Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo (con hot reload)
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e
```

---

## 📝 Notas Importantes

1. **Autenticación**: Todas las rutas protegidas requieren token JWT en header `Authorization: Bearer <token>`

2. **CORS**: Solo permite requests desde:
   - `https://app.itmcalibraciones.com`
   - `https://www.app.itmcalibraciones.com`
   - Para desarrollo local, modificar `main.ts`

3. **Archivos**: Los PDFs y certificados se almacenan en AWS S3 (`img.itmcalibraciones.com`)

4. **Índices únicos**:
   - Equipment: `serialNumber + office` (único)
   - Client: `socialReason`, `cuit` (únicos)
   - User: `email` (único)
