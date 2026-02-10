# Guía de Implementación de Paginación

## ✅ Estado Actual

**La paginación frontend está ACTIVADA** y funcionando correctamente con el backend.

El sistema soporta:

- ✅ Paginación simple con `limit` y `offset`
- ✅ Filtrado combinado (brand, equipmentType, etc.)
- ✅ Búsqueda inteligente (para clientes)
- ✅ Controladores de UI (siguiente, anterior, cambiar tamaño)

---

## 📋 Resumen

Se ha implementado un sistema completo de paginación en el frontend que se integra con la paginación implementada en el backend. El sistema es reutilizable, tipado y fácil de usar.

---

## 🏗️ Arquitectura

### 1. Tipos Compartidos (`src/utils/pagination.types.ts`)

Define interfaces TypeScript para:

- **`PaginationParams`**: Parámetros de consulta (limit, offset, sort, select, populate)
- **`PaginatedResponse<T>`**: Respuesta estándar del backend con metadata
- **`UsePaginationResult`**: Resultado del hook personalizado con estado y acciones

### 2. Hook de Paginación (`src/hooks/usePagination.ts`)

Hook reutilizable que maneja toda la lógica de paginación:

- Control de página actual y tamaño
- Cálculo automático de offset, totalPages, hasNext/Prev
- Acciones: nextPage, prevPage, goToPage, setPageSize, reset

### 3. Componente UI (`src/components/ui/PaginationControls.tsx`)

Componente visual con Material-UI que muestra:

- Selector de filas por página
- Información de rangos (ej: "1-10 de 50")
- Botones de navegación (anterior/siguiente)
- Estado de páginas

### 4. APIs Actualizadas

Todas las APIs ahora:

- Aceptan `PaginationParams` opcionales
- Construyen query strings automáticamente
- Retornan `PaginatedResponse<T>` (con adaptador si el backend devuelve arrays)

### 5. Hooks de Datos

Los hooks de React Query ahora:

- Aceptan parámetros de paginación
- Incluyen params en la `queryKey` para caching correcto
- Invalidan todas las variantes al mutar datos

---

## 🚀 Uso en Páginas

### ⚠️ Activación de Paginación (Backend Pendiente)

**Estado actual:** La paginación está comentada porque el backend devuelve `400 Bad Request` con parámetros.

**Para activar cuando el backend esté listo:**

```tsx
// ANTES (actual - desactivado):
const { data: brandsResponse } = useBrands();
// { limit: pagination.pageSize, offset: pagination.offset }

// DESPUÉS (cuando el backend acepte parámetros):
const { data: brandsResponse } = useBrands({
  limit: pagination.pageSize,
  offset: pagination.offset,
});
```

### Ejemplo Actual (BrandsPage / ClientsPage)

```tsx
import { useEffect } from "react";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/ui/PaginationControls";
import { useBrands } from "../hooks/useCatalog";

export const BrandsPage = () => {
  // 1. Configurar estado de paginación
  const pagination = usePagination({
    initialPageSize: 10,
    initialPage: 1,
  });

  // 2. Usar en la consulta (SIN parámetros por ahora)
  const { data: brandsResponse, isLoading } = useBrands();
  // ⚠️ Descomentar cuando el backend esté listo:
  // { limit: pagination.pageSize, offset: pagination.offset }

  // 3. Actualizar total cuando lleguen datos
  useEffect(() => {
    if (brandsResponse?.pagination?.total !== undefined) {
      const currentTotal = brandsResponse.pagination.total;
      if (currentTotal !== pagination.total) {
        pagination.goToPage(1);
      }
    }
  }, [brandsResponse?.pagination?.total]);

  // 4. Extraer datos
  const brands = brandsResponse?.data || [];

  return (
    <Box>
      {/* Renderizar tabla con brands */}

      {/* 5. Agregar controles (solo si hay más de 10 items) */}
      {brandsResponse?.pagination && brandsResponse.pagination.total > 10 && (
        <PaginationControls
          pagination={{
            ...pagination,
            total: brandsResponse.pagination.total,
          }}
        />
      )}
    </Box>
  );
};
```

## 🚀 Uso Actual en Páginas

### Marcas (BrandsPage)

```tsx
const pagination = usePagination({
  initialPageSize: 10,
  initialPage: 1,
});

const { data: brandsResponse } = useBrands({
  limit: pagination.pageSize,
  offset: pagination.offset,
});
```

**Endpoint usado:** `GET /brands?limit=10&offset=0`

### Modelos (ModelsPage) con Filtros

```tsx
const pagination = usePagination({
  initialPageSize: 10,
  initialPage: 1,
});

// Combinación de paginación + filtros
const queryFilters = {
  limit: pagination.pageSize,
  offset: pagination.offset,
  ...(filters.brand ? { brand: filters.brand } : {}),
  ...(filters.equipmentType ? { equipmentType: filters.equipmentType } : {}),
};

const { data: modelsResponse } = useModels(queryFilters);
```

**Endpoint usado:** `GET /models?limit=10&offset=0&brand=ID&equipmentType=ID`

### Clientes (ClientsPage)

```tsx
const pagination = usePagination({
  initialPageSize: 10,
  initialPage: 1,
});

const { data: clientsResponse } = useClients({
  limit: pagination.pageSize,
  offset: pagination.offset,
});
```

**Endpoint usado:** `GET /clients/all?limit=10&offset=0`

### Tipos de Equipo (EquipmentTypesPage)

Sin paginación (lista pequeña) - muestra todos los tipos disponibles.

---

## 🔧 Parámetros de Paginación Soportados

| Parámetro  | Tipo     | Descripción             | Ejemplo                        |
| ---------- | -------- | ----------------------- | ------------------------------ |
| `limit`    | number   | Elementos por página    | `limit=10`                     |
| `offset`   | number   | Desplazamiento (base 0) | `offset=20`                    |
| `sort`     | string   | Ordenamiento por campo  | `sort=-createdAt`              |
| `select`   | string[] | Campos a retornar       | `select=id&select=name`        |
| `populate` | string[] | Relaciones a poblar     | `populate=brand&populate=type` |

### Filtros Específicos por Endpoint

| Endpoint       | Filtros Disponibles                |
| -------------- | ---------------------------------- |
| `/brands`      | Ninguno (sin filtros adicionales)  |
| `/models`      | `brand` (ID), `equipmentType` (ID) |
| `/equipments`  | `serial` (búsqueda exacta)         |
| `/clients/all` | `search` (búsqueda inteligente)    |

---

## 📊 Ejemplos de Uso

### Búsqueda Inteligente en Clientes

```typescript
// Buscar por Razón Social, CUIT o Contacto
const response = await axios.get("/clients/all", {
  params: {
    limit: 10,
    offset: 0,
    search: "Empresa XYZ",
  },
});
```

### Filtrado de Modelos de una Marca

```typescript
const response = await axios.get("/models", {
  params: {
    limit: 50,
    offset: 0,
    brand: "507f1f77bcf86cd799439011",
  },
});
```

### Obtener Solo Campos Específicos

```typescript
const response = await axios.get("/equipments", {
  params: {
    limit: 100,
    offset: 0,
    select: ["id", "serial", "modelo"],
  },
});
```

---

### Filtros + Paginación

```tsx
const [filters, setFilters] = useState({ brand: "", equipmentType: "" });
const pagination = usePagination({ initialPageSize: 20 });

const { data } = useModels({
  ...filters,
  limit: pagination.pageSize,
  offset: pagination.offset,
  populate: ["brand", "equipmentType"],
});
```

### Tamaños de Página Personalizados

```tsx
<PaginationControls
  pagination={pagination}
  pageSizeOptions={[5, 10, 25, 50, 100]}
  showPageSizeSelector={true}
  showTotalInfo={true}
/>
```

### Ordenamiento

```tsx
const { data } = useClients({
  limit: pagination.pageSize,
  offset: pagination.offset,
  sort: "-createdAt", // Ordenar por fecha descendente
});
```

---

## 📦 Archivos Modificados/Creados

### ✅ Creados

- `src/utils/pagination.types.ts`
- `src/hooks/usePagination.ts`
- `src/components/ui/PaginationControls.tsx`

### ✅ Actualizados

- `src/modules/catalog/api/index.ts`
- `src/modules/catalog/hooks/useCatalog.ts`
- `src/modules/catalog/pages/BrandsPage.tsx`
- `src/modules/clients/api/clientsApi.ts`
- `src/modules/clients/hooks/useClients.ts`
- `src/modules/clients/pages/ClientsPage.tsx`

---

## 🔄 Compatibilidad con Backend

El sistema es compatible con respuestas en dos formatos:

### Formato Paginado (Preferido)

```json
{
  "data": [...],
  "pagination": {
    "total": 100,
    "limit": 10,
    "offset": 0,
    "page": 1,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Formato Array (Legacy)

```json
[...]
```

_Se adapta automáticamente a formato paginado en el frontend_

---

## 📝 Próximos Pasos

Para aplicar paginación a otros módulos:

1. **Actualizar API**

   ```ts
   export const getItems = async (params?: PaginationParams): Promise<PaginatedResponse<Item>>
   ```

2. **Actualizar Hook**

   ```ts
   export const useItems = (params?: PaginationParams) => {
     return useQuery({
       queryKey: ["items", params],
       queryFn: () => getItems(params),
     });
   };
   ```

3. **Usar en Página**

   ```tsx
   const pagination = usePagination({ initialPageSize: 10 });
   const { data } = useItems({
     limit: pagination.pageSize,
     offset: pagination.offset,
   });
   ```

4. **Agregar Controles UI**
   ```tsx
   <PaginationControls
     pagination={{ ...pagination, total: data?.pagination.total }}
   />
   ```

---

## 🎯 Beneficios

- ✅ **Reutilizable**: Un mismo hook y componente para todo el sistema
- ✅ **Tipado**: TypeScript completo sin `any`
- ✅ **Performante**: Caching correcto con React Query
- ✅ **Flexible**: Soporta filtros, ordenamiento y selección de campos
- ✅ **Consistente**: Misma API/UX en toda la aplicación
- ✅ **Retrocompatible**: Adapta respuestas legacy automáticamente

---

## 🐛 Troubleshooting

### Error: 400 Bad Request con parámetros de paginación

**Síntoma:** `GET /api/brands?limit=10&offset=0` devuelve 400

**Causa:** El backend aún no está configurado para aceptar estos parámetros o tiene validación estricta en el DTO.

**Solución:**

1. Verificar que el backend tenga los DTOs actualizados (QueryDTO con limit, offset, etc.)
2. Verificar que los handlers usen QueryBuilder correctamente
3. Verificar que el endpoint esté usando el DTO en el controller:
   ```typescript
   @Get()
   async findAll(@Query() query: GetBrandsDTO) {
     return this.queryBus.execute(new FindAllBrandsQuery(query));
   }
   ```

**Mientras tanto:** La paginación frontend ya está desactivada automáticamente.

### Error: types?.map is not a function

**Síntoma:** Componente crashea al intentar mapear datos

**Causa:** La página espera un array pero recibe `PaginatedResponse<T>` con estructura `{ data: [], pagination: {} }`

**Solución:** Extraer `.data` de la respuesta:

```typescript
// ✅ Correcto
const { data: brandsResponse } = useBrands();
const brands = brandsResponse?.data || [];

// ❌ Incorrecto
const { data: brands } = useBrands();
brands?.map(...) // ❌ brands es { data, pagination }, no un array
```

### Backend devuelve array en vez de formato paginado

**No hay problema** - Las APIs tienen un adaptador automático:

```typescript
// Si el backend devuelve: [...]
// El frontend lo adapta a:
{
  data: [...],
  pagination: {
    total: data.length,
    limit: data.length,
    offset: 0,
    page: 1,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  }
}
```

---

**¡Sistema de paginación listo para usar en todo el frontend!** 🎉
