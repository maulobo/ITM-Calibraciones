# 🎯 FLUJO DE USUARIO: Creación de Service Order con Equipos

## Flujo Frontend → Backend

### **PASO 1: Elegir Tipo de Instrumento**

```http
GET /equipment-types
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
  },
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
    "type": "Balanza",
    "description": "Instrumento para medir masa"
  }
]
```

**Usuario elige:** "Manómetro" → Guarda `equipmentTypeId = "65a1b2c3d4e5f6g7h8i9j0k1"`

---

### **PASO 2: Elegir Marca** (Opcional, puede ir directo a modelos)

```http
GET /brands
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
  },
  {
    "_id": "65b2c3d4e5f6g7h8i9j0k1l4",
    "name": "Testo"
  }
]
```

**Usuario elige:** "Fluke" → Guarda `brandId = "65b2c3d4e5f6g7h8i9j0k1l2"`

---

### **PASO 3: Elegir Modelo (FILTRADO)**

```http
GET /models?equipmentType=65a1b2c3d4e5f6g7h8i9j0k1&brand=65b2c3d4e5f6g7h8i9j0k1l2
```

**Filtros aplicados:**

- ✅ Solo manómetros (`equipmentType`)
- ✅ Solo marca Fluke (`brand`)

**Response:**

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

**Usuario elige:** "Aire 5.0" → Guarda `modelId = "65c3d4e5f6g7h8i9j0k1l2m3"`

---

### **PASO 4: Agregar Número de Serie y Detalles**

Usuario completa:

- **Serial Number**: "SN-12345"
- **Range** (opcional): "0-100 PSI"
- **Tag** (opcional): "TAG-001"

---

### **PASO 5: Crear Service Order**

```http
POST /service-orders
```

**Body:**

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
      "model": "65c3d4e5f6g7h8i9j0k1l2m3", // Aire 5.0
      "serialNumber": "SN-12345",
      "range": "0-100 PSI",
      "tag": "TAG-001"
    },
    {
      "model": "65c3d4e5f6g7h8i9j0k1l2m3", // Aire 5.0
      "serialNumber": "SN-12346",
      "range": "0-150 PSI",
      "tag": "TAG-002"
    }
  ]
}
```

**Backend automáticamente:**

1. ✅ Crea la Service Order
2. ✅ Crea/actualiza cada Equipment (busca por serialNumber)
3. ✅ El tipo de instrumento se hereda de `model.equipmentType`
4. ✅ Vincula equipos a la orden

---

## 📊 Estructura de Datos Final

### Equipment creado:

```javascript
{
  _id: "...",
  serialNumber: "SN-12345",
  model: {
    _id: "65c3d4e5f6g7h8i9j0k1l2m3",
    name: "Aire 5.0",
    brand: {
      _id: "65b2c3d4e5f6g7h8i9j0k1l2",
      name: "Fluke"
    },
    equipmentType: {  // ✅ AQUÍ está el tipo
      _id: "65a1b2c3d4e5f6g7h8i9j0k1",
      type: "Manómetro"
    }
  },
  office: "...",
  range: "0-100 PSI",
  tag: "TAG-001",
  technicalState: "TO_CALIBRATE",
  logisticState: "RECEIVED"
}
```

---

## ✅ Ventajas de Este Flujo

1. **Consistencia**: El tipo siempre coincide con el modelo del catálogo
2. **UX Simple**: Usuario filtra de forma natural (Tipo → Marca → Modelo)
3. **Sin redundancia**: El tipo se define UNA vez (en Model)
4. **Sin errores**: Imposible crear un equipo con tipo incorrecto
5. **Búsquedas rápidas**: Filtros eficientes en cada paso

---

## 🔍 Endpoints de Filtrado

### Todos los modelos de un tipo:

```
GET /models?equipmentType={id}
```

### Todos los modelos de una marca:

```
GET /models?brand={id}
```

### Manómetros Fluke (filtro combinado):

```
GET /models?equipmentType={id}&brand={id}
```

### Todos los modelos (sin filtros):

```
GET /models
```

---

## ⚠️ Validaciones Implementadas

- ✅ `equipmentType` es **REQUERIDO** en Model (no puede ser null)
- ✅ `brand` es **REQUERIDO** en Model
- ✅ `model` es **REQUERIDO** en Equipment
- ✅ El tipo se obtiene automáticamente desde el modelo

---

## 🎨 Ejemplo de Interfaz Usuario

```
┌─────────────────────────────────────────┐
│  1️⃣ Tipo de Instrumento                 │
│  ○ Manómetro                            │
│  ○ Termómetro                           │
│  ○ Balanza                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  2️⃣ Marca                                │
│  ○ Fluke                                │
│  ○ Ametek                               │
│  ○ Testo                                │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  3️⃣ Modelo                               │
│  ○ Aire 5.0                             │
│  ○ CPG2500                              │
│  (Solo modelos Fluke + Manómetro)       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  4️⃣ Detalles del Equipo                 │
│  N° Serie: [SN-12345]                   │
│  Rango:    [0-100 PSI]                  │
│  Tag:      [TAG-001]                    │
└─────────────────────────────────────────┘
```
