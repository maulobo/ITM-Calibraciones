# ENDPOINTS - Gestión de Catálogos de Equipos

## 📋 Resumen

Este documento describe los endpoints CRUD completos para gestionar Marcas, Modelos y Tipos de Equipos.

## 🔐 Autenticación

Todos los endpoints requieren autenticación JWT (excepto donde se indique).

### Roles:

- **ADMIN**: Acceso total (CREATE, READ, UPDATE, DELETE)
- **TECHNICAL**: Acceso de gestión (CREATE, READ, UPDATE)
- **USER**: Solo lectura (READ)

---

## 🏷️ BRANDS (Marcas)

### 1. Crear Marca

```http
POST /brands
```

**Auth**: ADMIN, TECHNICAL

**Body**:

```json
{
  "name": "Fluke"
}
```

**Response**: Objeto `Brand` creado

---

### 2. Listar Todas las Marcas

```http
GET /brands
```

**Auth**: Todos los roles autenticados

**Response**:

```json
[
  {
    "_id": "ObjectId",
    "name": "Fluke"
  }
]
```

---

### 3. Actualizar Marca

```http
PUT /brands/:id
```

**Auth**: ADMIN, TECHNICAL

**Params**:

- `id`: ObjectId de la marca

**Body**:

```json
{
  "name": "Fluke Corporation"
}
```

**Response**: Objeto `Brand` actualizado

---

### 4. Eliminar Marca

```http
DELETE /brands/:id
```

**Auth**: Solo ADMIN

**Params**:

- `id`: ObjectId de la marca

**Response**:

```json
{
  "deleted": true
}
```

---

## 📦 MODELS (Modelos)

### 1. Crear Modelo

```http
POST /models
```

**Auth**: ADMIN, TECHNICAL

**Body**:

```json
{
  "name": "Aire 5.0",
  "brand": "ObjectId",
  "equipmentType": "ObjectId" // opcional
}
```

**Response**: Objeto `Model` creado

---

### 2. Listar Modelos (con filtros opcionales)

```http
GET /models?brand=ObjectId&equipmentType=ObjectId
```

**Auth**: Todos los roles autenticados

**Query Params** (opcionales):

- `brand`: ObjectId - Filtrar por marca
- `equipmentType`: ObjectId - Filtrar por tipo de equipo

**Response**:

```json
[
  {
    "_id": "ObjectId",
    "name": "Aire 5.0",
    "brand": "ObjectId",
    "equipmentType": "ObjectId"
  }
]
```

**Ejemplos de uso**:

```
GET /models
GET /models?brand=507f1f77bcf86cd799439011
GET /models?equipmentType=507f1f77bcf86cd799439012
GET /models?brand=507f1f77bcf86cd799439011&equipmentType=507f1f77bcf86cd799439012
```

---

### 3. Actualizar Modelo

```http
PUT /models/:id
```

**Auth**: ADMIN, TECHNICAL

**Params**:

- `id`: ObjectId del modelo

**Body**:

```json
{
  "name": "Aire 5.0 PRO",
  "brand": "ObjectId",
  "equipmentType": "ObjectId"
}
```

**Response**: Objeto `Model` actualizado

---

### 4. Eliminar Modelo

```http
DELETE /models/:id
```

**Auth**: Solo ADMIN

**Params**:

- `id`: ObjectId del modelo

**Response**:

```json
{
  "deleted": true
}
```

---

## 🔧 EQUIPMENT TYPES (Tipos de Equipos)

### 1. Crear Tipo de Equipo

```http
POST /equipment-types
```

**Auth**: ADMIN, TECHNICAL

**Body**:

```json
{
  "type": "Manómetro",
  "description": "Instrumento para medir presión" // opcional
}
```

**Response**: Objeto `EquipmentType` creado

---

### 2. Listar Tipos de Equipos

```http
GET /equipment-types
```

**Auth**: Todos los roles autenticados

**Response**:

```json
[
  {
    "_id": "ObjectId",
    "type": "Manómetro",
    "description": "Instrumento para medir presión"
  }
]
```

---

### 3. Actualizar Tipo de Equipo

```http
PUT /equipment-types/:id
```

**Auth**: ADMIN, TECHNICAL

**Params**:

- `id`: ObjectId del tipo

**Body**:

```json
{
  "type": "Manómetro Digital",
  "description": "Instrumento digital para medir presión"
}
```

**Response**: Objeto `EquipmentType` actualizado

---

### 4. Eliminar Tipo de Equipo

```http
DELETE /equipment-types/:id
```

**Auth**: Solo ADMIN

**Params**:

- `id`: ObjectId del tipo

**Response**:

```json
{
  "deleted": true
}
```

---

## 🔗 Relaciones

### Modelo → Marca (Requerido)

Todo modelo **debe** tener una marca asociada.

### Modelo → Tipo de Equipo (Opcional)

Un modelo **puede** tener un tipo de equipo asociado. Esto permite:

- Filtrar modelos por tipo de instrumento
- Identificar qué modelos corresponden a manómetros, termómetros, etc.
- Clasificar el catálogo de instrumentos

---

## 🚀 Flujo de Trabajo Recomendado

### Para crear un nuevo instrumento en el catálogo:

1. **Crear/Verificar Marca**:

   ```
   POST /brands
   { "name": "Fluke" }
   ```

2. **Crear/Verificar Tipo de Equipo**:

   ```
   POST /equipment-types
   { "type": "Multímetro", "description": "..." }
   ```

3. **Crear Modelo** (vinculando marca y tipo):
   ```
   POST /models
   {
     "name": "Fluke 87V",
     "brand": "507f1f77bcf86cd799439011",
     "equipmentType": "507f1f77bcf86cd799439012"
   }
   ```

### Para buscar modelos específicos:

```
# Todos los modelos de una marca
GET /models?brand=507f1f77bcf86cd799439011

# Todos los manómetros (sin importar la marca)
GET /models?equipmentType=507f1f77bcf86cd799439012

# Manómetros de una marca específica
GET /models?brand=507f1f77bcf86cd799439011&equipmentType=507f1f77bcf86cd799439012
```

---

## ⚠️ Notas Importantes

1. **Eliminaciones**: Solo ADMIN puede eliminar registros
2. **ObjectIds**: Todos los IDs deben ser ObjectIds válidos de MongoDB
3. **Relaciones**: Al eliminar una marca o tipo, los modelos asociados **NO** se eliminan automáticamente (debes gestionarlo manualmente)
4. **equipmentType**: Es opcional en modelos, pero recomendado para mejor organización

---

## 📊 Estados Actuales

### Base de Datos Actual (Docker MongoDB)

- ✅ 1 ciudad creada
- ✅ 1 cliente creado
- ✅ 1 usuario admin (user@user.com)
- 📦 Catálogos vacíos (esperando importación)

### Pendiente

- Importar datos de JSON (brands, models, equipmenttypes)
- Asignar equipmentType a ~200 modelos existentes
- Verificar relaciones antes de producción
