# 📋 QUICK START - API de Equipos

## 🚀 Para empezar en 5 minutos

### 1. Autenticación

Todos los endpoints requieren JWT:

```javascript
headers: {
  'Authorization': 'Bearer {token}',
  'Content-Type': 'application/json'
}
```

### 2. Flujo Básico (Crear Service Order)

```javascript
// Paso 1: Cargar catálogos
const tipos = await GET("/equipment-types");
const marcas = await GET("/brands");

// Paso 2: Usuario elige tipo y marca
const tipoId = "..."; // Ej: Manómetro
const marcaId = "..."; // Ej: Fluke

// Paso 3: Filtrar modelos
const modelos = await GET(`/models?equipmentType=${tipoId}&brand=${marcaId}`);

// Paso 4: Crear orden con equipos
await POST("/service-orders", {
  office: "officeId",
  contact: { name, email, phone, role },
  items: [
    { model: "modelId", serialNumber: "SN-123", range: "0-100", tag: "TAG-01" },
  ],
});
```

## 📚 Endpoints Principales

### Catálogo

```
GET    /equipment-types          Lista tipos
POST   /equipment-types          Crear tipo (ADMIN/TECHNICAL)
GET    /brands                   Lista marcas
POST   /brands                   Crear marca (ADMIN/TECHNICAL)
GET    /models                   Lista modelos
GET    /models?equipmentType=X   Filtrar por tipo
GET    /models?brand=Y           Filtrar por marca
POST   /models                   Crear modelo (ADMIN/TECHNICAL)
```

### Service Orders

```
POST   /service-orders           Crear orden + equipos
GET    /service-orders           Listar órdenes
GET    /service-orders/:id       Ver detalle
```

### Equipos

```
GET    /equipments               Listar equipos
GET    /equipments/:id           Ver detalle
PUT    /equipments/:id           Actualizar (ADMIN/TECHNICAL)
```

## ⚠️ Datos Importantes

### Crear Modelo (REQUERIDOS)

```json
{
  "name": "Aire 5.0",
  "brand": "ObjectId", // ✅ REQUERIDO
  "equipmentType": "ObjectId" // ✅ REQUERIDO
}
```

### Crear Service Order (REQUERIDOS)

```json
{
  "office": "ObjectId", // ✅ REQUERIDO
  "contact": {
    // ✅ REQUERIDO
    "name": "string",
    "email": "string",
    "phone": "string",
    "role": "string"
  },
  "items": [
    // ✅ REQUERIDO (mínimo 1)
    {
      "model": "ObjectId", // ✅ REQUERIDO
      "serialNumber": "string", // ✅ REQUERIDO
      "range": "string", // Opcional
      "tag": "string" // Opcional
    }
  ]
}
```

## 🔑 Lógica Especial

### Upsert de Equipos

El backend identifica equipos por: **`serialNumber + model`**

**Ejemplo:**

```
Cliente TGS, Manómetro SN-123 modelo "Aire 5.0"
- Año 2025: Vino de "Oficina Norte"
- Año 2026: Vino de "Oficina Sur"

✅ Backend:
1. Encuentra el equipo (SN-123 + Aire 5.0)
2. Actualiza office → "Sur"
3. NO crea duplicado
```

### UI: Botón "Nuevo Modelo"

Si un modelo no existe, el dropdown debe tener:

```
[Dropdown Modelos ▼]  [+ Nuevo Modelo]
```

Modal rápido:

1. POST /models con nombre, marca, tipo
2. Agregar a dropdown
3. Seleccionar automáticamente
4. Continuar flujo

## 🎯 Roles y Permisos

| Acción                     | USER | TECHNICAL | ADMIN |
| -------------------------- | ---- | --------- | ----- |
| Ver catálogos              | ✅   | ✅        | ✅    |
| Crear tipos/marcas/modelos | ❌   | ✅        | ✅    |
| Crear service orders       | ❌   | ✅        | ✅    |
| Actualizar equipos         | ❌   | ✅        | ✅    |
| Eliminar (DELETE)          | ❌   | ❌        | ✅    |

## 📖 Documentación Completa

Ver [GUIA_FRONTEND.md](GUIA_FRONTEND.md) para:

- Flujo detallado paso a paso
- Ejemplos de código completos
- Casos de uso especiales
- Estructura de datos completa
- Estados de equipos

## 🧪 Testing Rápido

```bash
# 1. Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@user.com","password":"tu_password"}'

# 2. Listar tipos (con token)
curl -X GET http://localhost:3000/equipment-types \
  -H "Authorization: Bearer {tu_token}"

# 3. Crear modelo
curl -X POST http://localhost:3000/models \
  -H "Authorization: Bearer {tu_token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","brand":"brandId","equipmentType":"typeId"}'
```

## ❓ Preguntas Frecuentes

**P: ¿Puedo crear un equipo sin modelo?**  
R: No, el modelo es requerido.

**P: ¿El tipo de instrumento va en el equipo?**  
R: No, se hereda del modelo. Solo se define en Model.

**P: ¿Qué pasa si envío el mismo serial dos veces?**  
R: Si es el mismo modelo, actualiza. Si es distinto modelo, crea otro.

**P: ¿Puedo crear modelos desde el flujo de service order?**  
R: Sí, usa el botón [+ Nuevo Modelo] en el dropdown.

---

**Base URL:** `http://localhost:3000` (desarrollo)  
**Versión:** 1.0  
**Última actualización:** 27 Enero 2026
