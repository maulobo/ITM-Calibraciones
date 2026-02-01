# Plan de Implementación - Frontend ITM Calibraciones

Basado en la documentación de la API y los requisitos del usuario, este es el plan paso a paso para implementar el frontend.

## 1. Configuración Inicial y Arquitectura
- [ ] **Validar Configuración**: Verificar que `VITE_API_URL` apunte a `http://localhost:3000` (según doc del backend).
- [ ] **Estructura de Módulos**: Crear las carpetas base para los nuevos módulos:
    - `src/modules/catalog` (Tipos, Marcas, Modelos)
    - `src/modules/equipments` (Inventario de equipos físicos)
    - Completar `src/modules/service-orders` (Gestión de órdenes)

## 2. Módulo de Catálogo (Admin/Técnico)
Este módulo es pre-requisito para crear órdenes.
- [ ] **API Services**: Implementar servicios en `src/modules/catalog/api` para:
    - `GET/POST /equipment-types`
    - `GET/POST /brands`
    - `GET/POST /models` (incluyendo filtros)
- [ ] **Páginas de Gestión**:
    - Listado y Creación de **Tipos de Instrumentos**.
    - Listado y Creación de **Marcas**.
    - Listado y Creación de **Modelos** (con selector de Marca y Tipo).

## 3. Módulo de Órdenes de Servicio (Core Flow)
El flujo principal de la aplicación.
- [ ] **API Services**: Implementar `src/modules/service-orders/api` para `POST /service-orders`.
- [ ] **Formulario de Creación (Wizard/Pasos)**:
    - **Paso 1: Datos Generales**: Oficina y Contacto.
    - **Paso 2: Selección de Equipos**:
        - Dropdown Cascada: Tipo -> Marca -> Modelo (filtrado).
        - **Feature Crítica**: Botón `[+ Nuevo Modelo]` dentro del selector.
        - Modal de "Creación Rápida de Modelo" (Nombre + Marca + Tipo).
    - **Paso 3: Detalles del Ítem**: Serial Number (Req), Range, Tag.
    - **Paso 4: Lista de Ítems**: Visualizar equipos agregados antes de confirmar.
- [ ] **Vista de Detalle**: Ver una orden creada y sys equipos vinculados.

## 4. Módulo de Equipos Físicos (Inventario)
Para seguimiento y cambio de estados.
- [ ] **API Services**: Implementar `src/modules/equipments/api`.
- [ ] **Listado de Equipos**: Tabla con filtros (Oficina, Estado, Modelo).
- [ ] **Detalle de Equipo**: Ver historial, datos del modelo y estado actual.
- [ ] **Actualización de Estado**: UI para transiciones (CREATED -> TO_CALIBRATE -> etc.).

## 5. UI/UX y Estilos
- [ ] **Look & Feel**: Diseño moderno ("Premium") usando Material UI + personalización.
- [ ] **Feedback**: Toasts/Alertas para éxito/error (ej: "Modelo creado exitosamente").
- [ ] **Validaciones**: Uso de Zod para validar campos requeridos (Serial, Model, etc.).

## 6. Testing Manual
- [ ] Verificar flujo: Crear Tipo -> Crear Marca -> Crear Orden con Nuevo Modelo -> Verificar Equipo creado.
