# 🐳 Plan de Dockerización e Inicialización - Sistema ITM

## 📋 Objetivo

Crear un entorno completamente dockerizado para el desarrollo y producción del sistema ITM, con inicialización automática de datos maestros desde archivos JSON.

---

## 🏗️ Arquitectura Docker Propuesta

```
┌─────────────────────────────────────────────────┐
│              Docker Compose Stack               │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐│
│  │   Frontend  │  │   Backend   │  │  Mongo  ││
│  │   Next.js   │  │   NestJS    │  │   DB    ││
│  │  Port 3000  │  │  Port 4000  │  │ 27017   ││
│  └──────┬──────┘  └──────┬──────┘  └────┬────┘│
│         │                │              │      │
│         └────────────────┴──────────────┘      │
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │        Mongo Init (seed-data)            │  │
│  │  Carga automática de datos al inicio     │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘

Volúmenes persistentes:
- mongo-data: Datos de MongoDB
- backend-uploads: Archivos subidos
- backend-tmp: Archivos temporales
```

---

## 📦 Datos a Migrar desde JSON

### Datos Maestros Detectados:

| Archivo JSON              | Colección MongoDB | Registros aprox. | Prioridad                  |
| :------------------------ | :---------------- | :--------------- | :------------------------- |
| `itm.states.json`         | `states`          | ~24              | 🔴 Alta (Base geográfica)  |
| `itm.cities.json`         | `cities`          | ~464             | 🔴 Alta (Base geográfica)  |
| `itm.brands.json`         | `brands`          | ~819             | 🔴 Alta (Catálogo)         |
| `itm.models.json`         | `models`          | ~2896            | 🔴 Alta (Catálogo)         |
| `itm.equipmenttypes.json` | `equipmenttypes`  | ~634             | 🔴 Alta (Catálogo)         |
| `itm.users.json`          | `users`           | ?                | 🟡 Media (Admin inicial)   |
| `itm.badgets.json`        | `badgets`         | ~155             | 🟢 Baja (Datos históricos) |
| `itm.counters.json`       | `counters`        | ?                | 🟡 Media (Secuencias)      |

**Decisión de diseño:** Los datos de **catálogos** (estados, ciudades, marcas, modelos, tipos) deben cargarse automáticamente al inicializar el entorno. Los datos transaccionales (presupuestos históricos) son opcionales.

---

## 🚀 Estrategia de Implementación

### Fase 1: Preparación de Scripts de Seed 🌱

**Objetivo:** Crear scripts que lean los JSON y los inserten en MongoDB al levantar el contenedor por primera vez.

**Estructura propuesta:**

```
itmcalibraciones-backend/
├── docker/
│   └── mongo-init/
│       ├── 01-init-db.js           # Crear índices y usuarios
│       ├── 02-seed-states.js       # Carga de provincias
│       ├── 03-seed-cities.js       # Carga de ciudades
│       ├── 04-seed-brands.js       # Carga de marcas
│       ├── 05-seed-models.js       # Carga de modelos
│       ├── 06-seed-equipmenttypes.js # Carga de tipos
│       └── data/
│           ├── states.json         # Copia limpia del JSON
│           ├── cities.json
│           ├── brands.json
│           ├── models.json
│           └── equipmenttypes.json
```

**Ventaja:** MongoDB ejecuta automáticamente los scripts `.js` en `/docker-entrypoint-initdb.d/` al crear la base de datos por primera vez.

---

### Fase 2: Dockerfiles Optimizados 🐋

#### Backend (NestJS)

```dockerfile
# Multi-stage build para optimizar tamaño
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
EXPOSE 4000
CMD ["node", "dist/main"]
```

#### Frontend (Next.js)

```dockerfile
# Multi-stage build
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

---

### Fase 3: Docker Compose Mejorado 🎼

**Características clave:**

- ✅ Health checks para esperar a que Mongo esté listo
- ✅ Networks aisladas
- ✅ Variables de entorno desde `.env`
- ✅ Volúmenes nombrados para persistencia
- ✅ Depends_on con condiciones
- ✅ Profiles para separar dev/prod

```yaml
version: "3.9"

services:
  mongo:
    image: mongo:7
    container_name: itm-mongo
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_ROOT_USER}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_ROOT_PASS}
      MONGO_INITDB_DATABASE: ${MONGO_DB_NAME}
    volumes:
      - mongo-data:/data/db
      - ./docker/mongo-init:/docker-entrypoint-initdb.d:ro
      - ../data:/data/seed:ro # JSONs accesibles para scripts
    ports:
      - "27017:27017"
    networks:
      - itm-network
    healthcheck:
      test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./itmcalibraciones-backend
      dockerfile: Dockerfile
    container_name: itm-backend
    environment:
      MONGO_URL: mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASS}@mongo:27017/${MONGO_DB_NAME}?authSource=admin
      APP_PORT: 4000
      NODE_ENV: ${NODE_ENV}
      FRONT_URL: ${FRONT_URL}
      # ... resto de variables
    depends_on:
      mongo:
        condition: service_healthy
    ports:
      - "4000:4000"
    volumes:
      - ./itmcalibraciones-backend/tmp:/app/tmp
      - backend-uploads:/app/uploads
    networks:
      - itm-network

  frontend:
    build:
      context: ./itmcalibraciones-front
      dockerfile: Dockerfile
    container_name: itm-frontend
    environment:
      NEXT_PUBLIC_API_URL: ${BACK_URL}
    depends_on:
      - backend
    ports:
      - "3000:3000"
    networks:
      - itm-network

volumes:
  mongo-data:
  backend-uploads:

networks:
  itm-network:
    driver: bridge
```

---

### Fase 4: Archivos de Configuración 📝

#### `.env.example` (template)

```env
# Database
MONGO_ROOT_USER=itm_admin
MONGO_ROOT_PASS=changeme_secure_password
MONGO_DB_NAME=itm

# App
NODE_ENV=development
FRONT_URL=http://localhost:3000
BACK_URL=http://localhost:4000

# AWS SES
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
EMAIL_FROM=app@itmcalibraciones.com

# Security
JWT_SECRET=your_jwt_secret_here
VERIFY_SECRET=your_verify_secret
RECAPTCHA_SECRET_KEY=your_recaptcha_key
```

#### `.dockerignore` (backend)

```
node_modules
dist
npm-debug.log
.env
.git
.vscode
coverage
*.md
```

#### `.dockerignore` (frontend)

```
node_modules
.next
npm-debug.log
.env.local
.git
.vscode
coverage
*.md
```

---

## 🎯 Comandos Principales

### Desarrollo (levantar todo limpio con seed)

```bash
# Primera vez (con inicialización de datos)
docker-compose down -v  # Limpiar volúmenes
docker-compose up --build

# Posteriores veces
docker-compose up
```

### Ver logs

```bash
docker-compose logs -f backend
docker-compose logs -f mongo
```

### Conectarse a Mongo

```bash
docker exec -it itm-mongo mongosh -u itm_admin -p changeme_secure_password --authenticationDatabase admin
```

### Rebuild solo un servicio

```bash
docker-compose up -d --build backend
```

### Ver datos cargados

```bash
docker exec -it itm-mongo mongosh -u itm_admin -p changeme_secure_password --authenticationDatabase admin itm --eval "db.brands.countDocuments()"
```

---

## ✅ Checklist de Implementación

### Preparación

- [ ] Crear carpeta `docker/mongo-init/` en el backend
- [ ] Copiar y limpiar archivos JSON (remover `$oid`, `$date`)
- [ ] Crear scripts JS de seed para cada colección
- [ ] Crear `.env.example` con todas las variables

### Dockerfiles

- [ ] Crear `Dockerfile` optimizado para backend
- [ ] Crear `Dockerfile` optimizado para frontend
- [ ] Crear `.dockerignore` para ambos

### Docker Compose

- [ ] Actualizar `docker-compose.yml` con la nueva estructura
- [ ] Configurar health checks
- [ ] Configurar volúmenes persistentes
- [ ] Configurar networks

### Testing

- [ ] Probar seed de datos (levantar desde cero)
- [ ] Verificar conexión backend → mongo
- [ ] Verificar conexión frontend → backend
- [ ] Probar persistencia (reiniciar contenedores)
- [ ] Verificar que los datos NO se dupliquen en reinicios

### Documentación

- [ ] Crear `README_DOCKER.md` con instrucciones
- [ ] Documentar troubleshooting común
- [ ] Documentar cómo agregar nuevos datos de seed

---

## 🔧 Troubleshooting Común

### Los datos se duplican al reiniciar

**Problema:** Los scripts de seed se ejecutan cada vez.  
**Solución:** MongoDB solo ejecuta los scripts en `/docker-entrypoint-initdb.d/` si la carpeta `/data/db` está vacía. Para re-seedear: `docker-compose down -v`

### Backend no conecta a Mongo

**Problema:** `ECONNREFUSED` o `Authentication failed`.  
**Solución:**

- Verificar que `depends_on` tenga `condition: service_healthy`
- Verificar usuario/contraseña en URL de conexión
- Agregar `?authSource=admin` si usas usuario root

### Frontend no se actualiza

**Problema:** Next.js cachea código.  
**Solución:** `docker-compose up --build frontend`

---

## 🎓 Recomendaciones de Arquitectura

### Para el Nuevo Sistema (TO-BE)

Cuando implementes los módulos nuevos (Servicio Técnico, Remitos, Patrones, Alquileres):

1. **Migración de Estados:**
   - Crea tablas/colecciones nuevas para `estadosTecnicos` y `estadosLogisticos`
   - No modifiques los datos de seed antiguos, agrega nuevos

2. **IDs Estables:**
   - Los IDs de MongoDB (`$oid`) deben mantenerse si otros datos referencian esas entidades
   - Los scripts de seed pueden usar `insertMany` con `_id` fijo

3. **Versionado:**
   - Crea carpetas por versión: `mongo-init/v1/`, `mongo-init/v2/`
   - Usa migrations (ej: [migrate-mongo](https://github.com/seppevs/migrate-mongo)) para cambios posteriores

---

## 📚 Referencias

- [MongoDB Docker Init](https://hub.docker.com/_/mongo) - Documentación oficial
- [Next.js Docker](https://nextjs.org/docs/deployment#docker-image) - Guía oficial
- [NestJS Docker](https://docs.nestjs.com/recipes/docker) - Guía oficial
- [Docker Compose Health Checks](https://docs.docker.com/compose/compose-file/compose-file-v3/#healthcheck)

---

**Próximos Pasos:**

1. Revisar y aprobar este plan
2. Comenzar con Fase 1 (scripts de seed)
3. Configurar `.env` con credenciales reales
4. Levantar stack completo y verificar

**Tiempo estimado:** 4-6 horas para implementación completa.
