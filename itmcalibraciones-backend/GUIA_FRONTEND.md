# 🔧 GUÍA COMPLETA: Gestión de Equipos - Frontend

## 📋 Índice

1. [Gestión de Catálogo](#1-gestión-de-catálogo)
2. [Flujo de Creación de Service Order](#2-flujo-de-creación-de-service-order)
3. [Gestión de Equipos Físicos](#3-gestión-de-equipos-físicos)
4. [Resumen de Endpoints](#4-resumen-de-endpoints)

---

## 1. GESTIÓN DE CATÁLOGO

### 🏷️ A. Crear Tipos de Instrumentos (Equipment Types)

**Primer paso: Define los tipos de instrumentos que calibrarán**

```http
POST /equipment-types
Authorization: Bearer {jwt_token}
Role: ADMIN o TECHNICAL
```

**Body:**

```json
{
  "type": "Manómetro",
  "description": "Instrumento para medir presión"
}
```

**Ejemplos de tipos comunes:**

- Manómetro
- Termómetro
- Balanza
- Multímetro
- Calibrador
- Vacuómetro

---

### 🏭 B. Crear Marcas (Brands)

**Segundo paso: Define las marcas de instrumentos**

```http
POST /brands
Authorization: Bearer {jwt_token}
Role: ADMIN o TECHNICAL
```

**Body:**

```json
{
  "name": "Fluke"
}
```

**Ejemplos de marcas:**

- Fluke
- Ametek
- Testo
- Ashcroft
- Wika

---

### 📦 C. Crear Modelos (Models)

**Tercer paso: Define modelos específicos (requiere marca + tipo)**

```http
POST /models
Authorization: Bearer {jwt_token}
Role: ADMIN o TECHNICAL
```

**Body:**

```json
{
  "name": "Aire 5.0",
  "brand": "65b2c3d4e5f6g7h8i9j0k1l2",
  "equipmentType": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**⚠️ IMPORTANTE:**

- `brand`: ID de la marca (debe existir)
- `equipmentType`: ID del tipo (debe existir)
- Ambos campos son **REQUERIDOS**

---

# 📝 MÓDULO NUEVO: INTEGRACIÓN DE PATRONES (Standards)

## 1. Concepto

Cuando un técnico calibra un equipo de cliente, debe seleccionar qué patrones (instrumentos maestros) usó para realizar esa medición. Esto luego se imprime en el certificado.

## 2. Pasos de Integración

### Paso A: Obtener lista de Patrones (Para el Select)

Hacer un GET a este endpoint para llenar un `<select multiple>` o un buscador.

**GET** `/standard-equipment`
_Header: Authorization: Bearer TOKEN_

**Respuesta esperada:**

```json
[
  {
    "_id": "697f...",
    "name": "Manómetro Patrón Principal",
    "serialNumber": "SN-FLUKE-9999",
    "status": "ACTIVO"
    // ...
  }
  // ...
]
```

> 💡 IMPORTANTE: Filtrar en el front solo los que tengan `status: "ACTIVO"` para evitar usar equipos vencidos. (Aunque el back permite todo, es buena UX).

---

### Paso B: Guardar la Calibración

Cuando el técnico termina el trabajo y le da a "Guardar" o "Finalizar Calibración", enviar los IDs de los patrones seleccionados en el campo `usedStandards`.

**PATCH** `/equipment` (Endpoint de actualización de equipo)
**Body:**

```json
{
  "id": "ID_DEL_EQUIPO_CLIENTE",
  "technicalState": "CALIBRATED",
  "calibrationDate": "2026-02-01",

  // ✅ CAMPO NUEVO (Array de IDs de Mongo)
  "usedStandards": ["697f98558ad9d98105aae637", "697f98558ad9d98105aae638"]
}
```

---

### Paso C: Visualización en Historial

Si quieres mostrar qué patrones se usaron en un equipo ya calibrado:

**GET** `/equipment?id=...` (o el get individual)

El backend devolverá el array `usedStandards` populado (con objetos completos, no solo IDs), para que puedas mostrar una tabla o lista:

```json
{
  "serialNumber": "1234",
  "usedStandards": [
    {
      "name": "Manómetro Patrón Principal",
      "serialNumber": "SN-FLUKE-9999",
      "certificateNumber": "LFS-2026-001"
    }
  ]
}
```

---

# 🚀 NUEVO: GESTIÓN DE FLUJO OPERATIVO (Service Workflow)

## 1. Mover Equipo a "Bandeja de Salida"

Cuando el equipo está técnicamente listo, pero falta administrativo (certificados, remito, etc.).

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "logisticState": "OUTPUT_TRAY", // <--- Nuevo Estado
  "technicalState": "CALIBRATED" // Confirmar estado técnico
}
```

---

## 2. Registrar Retiro (Entrega a Cliente)

Cuando el cliente viene a buscar el equipo y se cierra el servicio.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "logisticState": "DELIVERED",
  "retireDate": "2026-02-05T10:00:00Z", // Fecha Real

  // ✅ CAMPOS LEGALES NUEVOS
  "remittanceNumber": "R-0001-9999", // Obligatorio para salida
  "certificateNumber": "C-2026-555" // Opcional (si se emitió)
}
```

---

## 3. Enviar a Laboratorio Externo

Si el equipo no se calibra en ITM y se deriva a otro proveedor.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "location": "EXTERNAL", // Cambia ubicación física

  // ✅ DATOS DE PROVEEDOR
  "externalProvider": {
    "providerName": "Viditec",
    "sentDate": "2026-02-01",
    "projectedReturnDate": "2026-02-15",
    "exitNote": "Se envía con accesorios, maletín negro"
  }
}
```

---

## 4. Retorno de Laboratorio Externo (Reingreso)

Cuando el equipo vuelve del proveedor externo.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "location": "ITM", // Vuelve a ITM para control de calidad
  "logisticState": "IN_LABORATORY", // Vuelve a estar disponible

  // ✅ ACTUALIZAR DATOS DE RETORNO
  "externalProvider": {
    "providerName": "Viditec",
    "sentDate": "2026-02-01", // Mantener original
    "actualReturnDate": "2026-02-14", // <--- Fecha Real
    "exitNote": "Volvió OK"
  }
}
```

---

## 2. FLUJO DE CREACIÓN DE SERVICE ORDER

### 🎯 Paso a Paso en la Interfaz de Usuario

#### **PASO 0: Elegir Cliente y Oficina**

Para crear una orden, lo primero es identificar para quién es.

**A. Obtener lista de Clientes:**

```http
GET /clients/all
Authorization: Bearer {jwt_token}
```

**UI:** Mostrar en un Dropdown. Al seleccionar uno, obtenemos su `_id`.

**B. Obtener Oficinas del Cliente seleccionado:**

```http
GET /offices/all?client={clientId}
Authorization: Bearer {jwt_token}
```

**Ejemplo:** `GET /offices/all?client=69790b6fdf333143e95ba9b6`

**Response:**

```json
[
  {
    "_id": "69790b6fdf333143e95ba9b7",
    "name": "TGS Oficina Norte",
    "client": "69790b6fdf333143e95ba9b6",
    "city": { "name": "Buenos Aires", ... },
    "address": "Zona Norte"
  },
  {
    "_id": "69790b6fdf333143e95ba9b8",
    "name": "TGS Oficina Sur",
    "client": "69790b6fdf333143e95ba9b6",
    "city": { "name": "Buenos Aires", ... },
    "address": "Zona Sur"
  }
]
```

**UI:** Dropdown que se habilita solo después de elegir el cliente.

---

#### **PASO 1: Elegir Tipo de Instrumento**

```http
GET /equipment-types
Authorization: Bearer {jwt_token}
```

**Response:**

```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "type": "Manómetro",
    "description": "Instrumento para medir presión"
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "type": "Termómetro",
    "description": "Instrumento para medir temperatura"
  }
]
```

**UI:** Dropdown o lista de selección  
**Usuario selecciona:** "Manómetro"  
**Guarda:** `selectedEquipmentType = "65a1b2c3d4e5f6g7h8i9j0k1"`

---

#### **PASO 2: Elegir Marca (Opcional)**

```http
GET /brands
Authorization: Bearer {jwt_token}
```

**Response:**

```json
[
  {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
    "name": "Fluke"
  },
  {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l3",
    "name": "Ametek"
  }
]
```

**UI:** Dropdown de marcas (puede ser opcional)  
**Usuario selecciona:** "Fluke"  
**Guarda:** `selectedBrand = "65b2c3d4e5f6g7h8i9j0k1l2"`

---

#### **PASO 3: Elegir Modelo (Filtrado)**

```http
GET /models?equipmentType={selectedEquipmentType}&brand={selectedBrand}
Authorization: Bearer {jwt_token}
```

**Ejemplo real:**

```http
GET /models?equipmentType=65a1b2c3d4e5f6g7h8i9j0k1&brand=65b2c3d4e5f6g7h8i9j0k1l2
```

**Response (solo manómetros Fluke):**

```json
[
  {
    "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
    "name": "Aire 5.0",
    "brand": "65b2c3d4e5f6g7h8i9j0k1l2",
    "equipmentType": "65a1b2c3d4e5f6g7h8i9j0k1"
  },
  {
    "_id": "65c3d4e5f6g7h8i9j0k1l2m4",
    "name": "CPG2500",
    "brand": "65b2c3d4e5f6g7h8i9j0k1l2",
    "equipmentType": "65a1b2c3d4e5f6g7h8i9j0k1"
  }
]
```

**Opciones de filtrado:**

- `GET /models` - Todos los modelos
- `GET /models?equipmentType={id}` - Por tipo solamente
- `GET /models?brand={id}` - Por marca solamente
- `GET /models?equipmentType={id}&brand={id}` - Ambos filtros

**UI:** Dropdown de modelos filtrados + Botón **[+ Nuevo Modelo]**  
**Usuario selecciona:** "Aire 5.0"  
**Guarda:** `selectedModel = "65c3d4e5f6g7h8i9j0k1l2m3"`

**💡 CASO: Modelo No Existe (Equipo Nuevo/Raro)**

Si el modelo no está en la lista, el usuario hace clic en **[+ Nuevo Modelo]**:

```http
POST /models
Authorization: Bearer {jwt_token}
```

**Body (modal rápido):**

```json
{
  "name": "Modelo XYZ-2026",
  "brand": "65b2c3d4e5f6g7h8i9j0k1l2",
  "equipmentType": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response:**

```json
{
  "_id": "65c3d4e5f6g7h8i9j0k1l2m9",
  "name": "Modelo XYZ-2026",
  "brand": "65b2c3d4e5f6g7h8i9j0k1l2",
  "equipmentType": "65a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Frontend:**

- Cierra el modal
- Agrega el nuevo modelo al dropdown
- Lo selecciona automáticamente
- Usuario continúa con el flujo

---

#### **PASO 4: Completar Detalles del Equipo**

**UI:** Formulario para cada equipo

```javascript
{
  model: "65c3d4e5f6g7h8i9j0k1l2m3",  // Del paso anterior
  serialNumber: "SN-12345",            // Input requerido
  range: "0-100 PSI",                  // Input opcional
  tag: "TAG-001"                       // Input opcional
}
```

**UI:** Botón "Agregar otro equipo" para agregar más instrumentos a la lista

---

#### **PASO 5: Crear Service Order**

```http
POST /service-orders
Authorization: Bearer {jwt_token}
```

**Body completo:**

```json
{
  "office": "65d4e5f6g7h8i9j0k1l2m3n4",
  "contact": {
    "name": "Juan Pérez",
    "email": "juan@empresa.com",
    "phone": "+54 11 1234-5678",
    "role": "Responsable Técnico"
  },
  "items": [
    {
      "model": "65c3d4e5f6g7h8i9j0k1l2m3",
      "serialNumber": "SN-12345",
      "range": "0-100 PSI",
      "tag": "TAG-001"
    },
    {
      "model": "65c3d4e5f6g7h8i9j0k1l2m3",
      "serialNumber": "SN-12346",
      "range": "0-150 PSI",
      "tag": "TAG-002"
    }
  ]
}
```

**Response:**

```json
{
  "_id": "65e5f6g7h8i9j0k1l2m3n4o5",
  "code": "SO-2026-0001",
  "office": "65d4e5f6g7h8i9j0k1l2m3n4",
  "contact": {
    "name": "Juan Pérez",
    "email": "juan@empresa.com",
    "phone": "+54 11 1234-5678",
    "role": "Responsable Técnico"
  },
  "equipments": ["65f6g7h8i9j0k1l2m3n4o5p6", "65f6g7h8i9j0k1l2m3n4o5p7"],
  "state": "PENDING",
  "createdAt": "2026-01-27T14:35:00Z"
}
```

**Backend automáticamente:**

- ✅ Crea la Service Order
- ✅ Crea/actualiza cada Equipment (busca por **serialNumber + model**)
- ✅ **Actualiza el office** si el equipo ya existía (puede venir de otra oficina)
- ✅ Vincula equipos a la orden
- ✅ Asigna estados iniciales (TO_CALIBRATE, RECEIVED)

**🔑 Lógica de Upsert (Importante):**

El sistema identifica equipos existentes por: **`serialNumber + model`**

**Ejemplo de Caso Real:**

```
Cliente: TGS
Manómetro: SN-123, Modelo "Aire 5.0"

Año 2025: Vino desde "Oficina Norte" (office_norte_id)
Año 2026: Vino desde "Oficina Sur" (office_sur_id)

✅ El sistema:
1. Encuentra el equipo existente (SN-123 + Aire 5.0)
2. Actualiza su office a "Oficina Sur"
3. Lo vincula a la nueva orden
4. NO crea duplicado

❌ Si buscara por serial + office:
   Crearía 2 equipos (uno en Norte, uno en Sur)
```

**¿Por qué serialNumber + model?**

- ✅ Un número de serie es único **por modelo**
- ✅ El mismo equipo físico puede venir de diferentes oficinas
- ✅ Evita duplicados cuando el cliente reorganiza sus oficinas
- ✅ Mantiene historial completo del equipo

---

## 3. GESTIÓN DE EQUIPOS FÍSICOS

### 📋 A. Listar Equipos

```http
GET /equipments
Authorization: Bearer {jwt_token}
```

**Con filtros:**

```http
GET /equipments?office={officeId}
GET /equipments?state=TO_CALIBRATE
GET /equipments?outOfService=false
```

---

### 🔍 B. Ver Detalle de Equipo

```http
GET /equipments/{id}
Authorization: Bearer {jwt_token}
```

**Response (con modelo poblado):**

```json
{
  "_id": "65f6g7h8i9j0k1l2m3n4o5p6",
  "serialNumber": "SN-12345",
  "model": {
    "_id": "65c3d4e5f6g7h8i9j0k1l2m3",
    "name": "Aire 5.0",
    "brand": {
      "_id": "65b2c3d4e5f6g7h8i9j0k1l2",
      "name": "Fluke"
    },
    "equipmentType": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "type": "Manómetro"
    }
  },
  "office": "65d4e5f6g7h8i9j0k1l2m3n4",
  "range": "0-100 PSI",
  "tag": "TAG-001",
  "technicalState": "TO_CALIBRATE",
  "logisticState": "RECEIVED",
  "calibrationDate": null,
  "calibrationExpirationDate": null,
  "outOfService": false
}
```

---

### ✏️ C. Actualizar Equipo

```http
PUT /equipments/{id}
Authorization: Bearer {jwt_token}
```

**Body:**

```json
{
  "range": "0-120 PSI",
  "description": "Calibrado anualmente",
  "technicalState": "IN_CALIBRATION"
}
```

---

### ❌ D. Eliminar Equipo

```http
DELETE /equipments/{id}
Authorization: Bearer {jwt_token}
Role: Solo ADMIN
```

---

## 4. RESUMEN DE ENDPOINTS

### 📚 Catálogo (Equipment Types)

| Método | Endpoint               | Roles            | Descripción     |
| ------ | ---------------------- | ---------------- | --------------- |
| POST   | `/equipment-types`     | ADMIN, TECHNICAL | Crear tipo      |
| GET    | `/equipment-types`     | Todos            | Listar tipos    |
| PUT    | `/equipment-types/:id` | ADMIN, TECHNICAL | Actualizar tipo |
| DELETE | `/equipment-types/:id` | ADMIN            | Eliminar tipo   |

### 🏭 Catálogo (Brands)

| Método | Endpoint      | Roles            | Descripción      |
| ------ | ------------- | ---------------- | ---------------- |
| POST   | `/brands`     | ADMIN, TECHNICAL | Crear marca      |
| GET    | `/brands`     | Todos            | Listar marcas    |
| PUT    | `/brands/:id` | ADMIN, TECHNICAL | Actualizar marca |
| DELETE | `/brands/:id` | ADMIN            | Eliminar marca   |

### 📦 Catálogo (Models)

| Método | Endpoint                                | Roles            | Descripción       |
| ------ | --------------------------------------- | ---------------- | ----------------- |
| POST   | `/models`                               | ADMIN, TECHNICAL | Crear modelo      |
| GET    | `/models`                               | Todos            | Listar modelos    |
| GET    | `/models?equipmentType={id}`            | Todos            | Filtrar por tipo  |
| GET    | `/models?brand={id}`                    | Todos            | Filtrar por marca |
| GET    | `/models?equipmentType={id}&brand={id}` | Todos            | Filtrar por ambos |
| PUT    | `/models/:id`                           | ADMIN, TECHNICAL | Actualizar modelo |
| DELETE | `/models/:id`                           | ADMIN            | Eliminar modelo   |

### 🔧 Equipos (Equipment)

| Método | Endpoint          | Roles            | Descripción       |
| ------ | ----------------- | ---------------- | ----------------- |
| POST   | `/equipments`     | ADMIN, TECHNICAL | Crear equipo      |
| GET    | `/equipments`     | Todos            | Listar equipos    |
| GET    | `/equipments/:id` | Todos            | Ver detalle       |
| PUT    | `/equipments/:id` | ADMIN, TECHNICAL | Actualizar equipo |
| DELETE | `/equipments/:id` | ADMIN            | Eliminar equipo   |

### 📝 Service Orders

| Método | Endpoint              | Roles            | Descripción             |
| ------ | --------------------- | ---------------- | ----------------------- |
| POST   | `/service-orders`     | ADMIN, TECHNICAL | Crear orden (+ equipos) |
| GET    | `/service-orders`     | Todos            | Listar órdenes          |
| GET    | `/service-orders/:id` | Todos            | Ver detalle             |
| PUT    | `/service-orders/:id` | ADMIN, TECHNICAL | Actualizar orden        |

---

## 🎨 Ejemplo de Flujo UI Completo

```javascript
// 1. CARGAR CATÁLOGO INICIAL (al montar componente)
const equipmentTypes = await fetch("/equipment-types").then((r) => r.json());
const brands = await fetch("/brands").then((r) => r.json());

// 2. USUARIO ELIGE TIPO
const selectedTypeId = "65a1b2c3d4e5f6g7h8i9j0k1"; // Manómetro

// 3. USUARIO ELIGE MARCA (opcional)
const selectedBrandId = "65b2c3d4e5f6g7h8i9j0k1l2"; // Fluke

// 4. CARGAR MODELOS FILTRADOS
let models = await fetch(
  `/models?equipmentType=${selectedTypeId}&brand=${selectedBrandId}`,
).then((r) => r.json());

// 5. USUARIO COMPLETA FORMULARIO
let selectedModelId = "65c3d4e5f6g7h8i9j0k1l2m3"; // Del dropdown

// 💡 CASO ESPECIAL: Si el modelo no existe
if (userClickedNewModel) {
  const newModel = await fetch("/models", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: "Modelo Nuevo XYZ",
      brand: selectedBrandId,
      equipmentType: selectedTypeId,
    }),
  }).then((r) => r.json());

  // Agregar a la lista y seleccionar
  models.push(newModel);
  selectedModelId = newModel._id;
}

const equipment = {
  model: selectedModelId,
  serialNumber: "SN-12345",
  range: "0-100 PSI",
  tag: "TAG-001",
};

// 6. AGREGAR A LISTA (puede agregar múltiples)
const equipmentList = [equipment, equipment2, equipment3];

// 7. CREAR SERVICE ORDER
const serviceOrder = await fetch("/service-orders", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    office: officeId,
    contact: {
      name: "Juan Pérez",
      email: "juan@empresa.com",
      phone: "+54 11 1234-5678",
      role: "Responsable",
    },
    items: equipmentList,
  }),
}).then((r) => r.json());

console.log("Service Order creada:", serviceOrder.code);
console.log("Equipos creados/actualizados:", serviceOrder.equipments.length);
```

---

## ⚠️ Validaciones Importantes

### Al crear Model:

- ✅ `brand` es REQUERIDO (debe existir)
- ✅ `equipmentType` es REQUERIDO (debe existir)
- ✅ `name` es REQUERIDO

### Al crear Service Order:

- ✅ `office` es REQUERIDO
- ✅ `contact` es REQUERIDO (name, email, phone, role)
- ✅ `items` array con al menos 1 equipo
- ✅ Cada item debe tener `model` y `serialNumber`

### Al crear Equipment directamente:

- ✅ `model` es REQUERIDO (debe existir)
- ✅ `office` es REQUERIDO (debe existir)
- ✅ `serialNumber` es REQUERIDO
- ⚠️ NO se envía `equipmentType` (se hereda del modelo)

---

## 🔄 Flujo de Estados del Equipo

```
CREATED → TO_CALIBRATE → IN_CALIBRATION → CALIBRATED → DELIVERED
                              ↓
                        OUT_OF_SERVICE
```

**Estados técnicos:**

- `TO_CALIBRATE`: Recién ingresado, pendiente de calibración
- `IN_CALIBRATION`: En proceso de calibración
- `CALIBRATED`: Calibración completada
- `OUT_OF_SERVICE`: Fuera de servicio

**Estados logísticos:**

- `RECEIVED`: Recibido en laboratorio
- `IN_PROCESS`: En proceso
- `READY`: Listo para entrega
- `DELIVERED`: Entregado al cliente

---

## 📊 Estructura de Datos Completa

```javascript
// EQUIPMENT TYPE
{
  _id: "...",
  type: "Manómetro",
  description: "Instrumento para medir presión"
}

// BRAND
{
  _id: "...",
  name: "Fluke"
}

// MODEL
{
  _id: "...",
  name: "Aire 5.0",
  brand: ObjectId → Brand,
  equipmentType: ObjectId → EquipmentType
}

// EQUIPMENT
{
  _id: "...",
  serialNumber: "SN-12345",
  model: ObjectId → Model (que tiene brand + equipmentType),
  office: ObjectId → Office,
  range: "0-100 PSI",
  tag: "TAG-001",
  technicalState: "TO_CALIBRATE",
  logisticState: "RECEIVED",
  calibrationDate: Date,
  calibrationExpirationDate: Date,
  outOfService: false
}

// SERVICE ORDER
{
  _id: "...",
  code: "SO-2026-0001",
  office: ObjectId → Office,
  contact: { name, email, phone, role },
  equipments: [ObjectId → Equipment],
  state: "PENDING"
}
```

---

## 🚀 Orden Recomendado de Implementación en Frontend

1. **Gestión de Catálogo** (Panel de Admin)

   - CRUD Equipment Types
   - CRUD Brands
   - CRUD Models (con filtros)

2. **Creación de Service Order** (Flujo Principal)

   - Selector de tipo → marca → modelo
   - **Botón "Nuevo Modelo"** (modal rápido para crear on-the-fly)
   - Formulario de detalles de equipos
   - Lista de equipos a calibrar
   - Creación de orden

3. **Gestión de Equipos** (Tracking)
   - Lista de equipos
   - Detalle de equipo
   - Actualización de estados
   - Historial de calibraciones

---

## 🎯 Casos de Uso Importantes

### ✅ Caso 1: Equipo Existente que Viene de Otra Oficina

**Escenario:**

- Cliente TGS tiene oficina Norte y Sur
- Manómetro SN-123 vino el año pasado desde Norte
- Este año viene desde Sur

**Backend Automático:**

```javascript
// Busca: serialNumber=SN-123 + model=Aire5.0
// Encuentra el equipo existente
// Actualiza:
{
  office: "sur_id",  // ✅ Cambió de Norte a Sur
  serviceOrder: "nueva_orden_id",
  technicalState: "TO_CALIBRATE"
}
```

**Resultado:**

- ✅ 1 solo equipo con historial completo
- ✅ Office actualizado
- ❌ NO duplicados

---

### ✅ Caso 2: Modelo No Existe (Equipo Raro)

**Escenario:**

- Llega un calibrador marca "Mensor" modelo "CPT6100"
- Nunca lo calibraron antes
- Modelo no está en el dropdown

**Flujo UI:**

1. Usuario hace clic en **[+ Nuevo Modelo]**
2. Modal se abre con:
   - Input: Nombre del modelo ("CPT6100")
   - Select: Marca (ya tiene "Mensor" seleccionada del paso anterior)
   - Select: Tipo (ya tiene "Calibrador" seleccionado)
3. Usuario confirma
4. Frontend:
   - POST /models (crea el modelo)
   - Agrega a dropdown
   - Lo selecciona automáticamente
5. Usuario continúa con serial number

**Resultado:**

- ✅ Usuario NO se traba
- ✅ Modelo queda en catálogo para próximas veces
- ✅ Flujo continuo sin interrupciones

---

### ✅ Caso 3: Mismo Serial, Distinto Modelo (Raro pero posible)

**Escenario:**

- Cliente tiene 2 fabricantes que usan numeración similar
- Fluke SN-100 (Manómetro)
- Ametek SN-100 (Termómetro)

**Backend:**

```javascript
// Busca: serialNumber=SN-100 + model=Fluke_Aire5.0
// Busca: serialNumber=SN-100 + model=Ametek_XYZ
```

**Resultado:**

- ✅ 2 equipos diferentes (serial + modelo es único)
- ✅ No hay conflicto

---

**¿Necesitas ejemplos más específicos de algún componente o endpoint en particular?**
