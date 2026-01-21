# 📋 Plan de Implementación - ITM Calibraciones v2.0

## 📊 Resumen Ejecutivo

Este documento detalla todas las modificaciones, nuevas funcionalidades y módulos que se deben implementar en el sistema ITM Calibraciones.

---

## 🎯 Fase 1: Modelos de Datos y Migraciones (CRÍTICO)

### 1.1 Nuevas Entidades / Schemas

#### ✅ ServiceTechnical (Servicio Técnico)
```typescript
{
  number: number,              // Auto-incremental (ST-001, ST-002...)
  client: ObjectId,            // Referencia a Client
  office: ObjectId,            // Referencia a Office
  contact: ObjectId,           // Referencia a Contact (nuevo)
  createdDate: Date,           // Fecha de creación
  estimatedDate: Date,         // Fecha estimada de calibración
  status: ServiceStatus,       // Enum: INGRESO, EN_PROCESO, LISTO_PARA_RETIRAR, RETIRADO, etc.
  laboratory: Laboratory,      // ITM / EXTERNO
  externalProvider?: {         // Si es laboratorio externo
    name: string,              // Siafa, Viditec, etc.
    sendDate: Date,            // Fecha envío al proveedor
    exitNote: string,          // Nota de salida
    expectedReturnDate: Date,  // Fecha proyectada retorno
    actualReturnDate: Date     // Fecha real de retorno
  },
  retireInfo?: {               // Cuando se retira
    retireDate: Date,          // Fecha de retiro
    calibrationDate: Date,     // Fecha de calibración
    certificateNumber: string, // Nº de certificado
    remittanceNumber: string,  // Nº de remito
    notificationSent: boolean  // Si se envió aviso de retiro
  },
  purchaseOrder: POStatus,     // SI / NO / NO_REQUIERE
  budgetNumber: string,        // Nº de presupuesto asociado
  pipeLink: string,            // Link de Pipe
  equipmentCount: number       // Total de equipos en este ST
}

enum ServiceStatus {
  INGRESO = 'INGRESO',
  EN_PROCESO = 'EN_PROCESO',
  CALIBRADO = 'CALIBRADO',
  VERIFICADO = 'VERIFICADO',
  REPARADO = 'REPARADO',
  FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
  DEVOLUCION_SIN_CALIBRACION = 'DEVOLUCION_SIN_CALIBRACION',
  LISTO_PARA_RETIRAR = 'LISTO_PARA_RETIRAR',
  BANDEJA_SALIDA = 'BANDEJA_SALIDA',
  FRENADO_EN_ESPERA = 'FRENADO_EN_ESPERA',
  RETIRADO = 'RETIRADO'
}

enum Laboratory {
  ITM = 'ITM',
  EXTERNO = 'EXTERNO'
}

enum POStatus {
  SI = 'SI',
  NO = 'NO',
  NO_REQUIERE = 'NO_REQUIERE'
}
```

#### ✅ Contact (Contacto)
```typescript
{
  client: ObjectId,            // Referencia a Client
  office: ObjectId,            // Referencia a Office
  firstName: string,           // Nombre
  lastName: string,            // Apellido
  email: string,               // Email
  phone: string,               // Teléfono
  area?: string,               // Área (Instrumentación, Mecánica, etc.)
  tagNumber?: string,          // Nº de TAG
  active: boolean              // Activo/Inactivo
}
```

#### ✅ StandardEquipment (Equipos Patrones)
```typescript
{
  name: string,                // Nombre del equipo
  brand: ObjectId,             // Referencia a Brand
  model: ObjectId,             // Referencia a Model
  serialNumber: string,        // N/S (único)
  range: string,               // Rango
  certificate: string,         // URL del certificado actual
  certificateHistory: [{       // Historial de certificados
    certificate: string,
    uploadDate: Date,
    expirationDate: Date
  }],
  calibrationDate: Date,       // Fecha calibración actual
  calibrationExpirationDate: Date, // Fecha vencimiento
  state: PatronState,          // DISPONIBLE, EN_USO, VENCIDO, FUERA_SERVICIO
  observations?: string
}

enum PatronState {
  DISPONIBLE = 'DISPONIBLE',
  EN_USO = 'EN_USO',
  VENCIDO = 'VENCIDO',
  FUERA_SERVICIO = 'FUERA_SERVICIO'
}
```

#### ✅ RentalEquipment (Equipos de Alquiler)
```typescript
{
  name: string,                // Nombre del equipo
  brand: ObjectId,             // Referencia a Brand
  model: ObjectId,             // Referencia a Model
  serialNumber: string,        // N/S (único)
  range: string,               // Rango
  observations?: string,
  status: RentalStatus,        // Estado
  calibrationCertificate: string, // Último certificado
  calibrationExpirationDate: Date, // Vencimiento calibración
  lastClient?: ObjectId,       // Último cliente que lo alquiló
  returnDate?: Date,           // Fecha de devolución esperada
  rentalHistory: [{            // Historial de alquileres
    client: ObjectId,
    startDate: Date,
    returnDate: Date,
    certificate: string
  }]
}

enum RentalStatus {
  ALQUILADO = 'ALQUILADO',
  RESERVADO = 'RESERVADO',
  DISPONIBLE = 'DISPONIBLE',
  FUERA_SERVICIO = 'FUERA_SERVICIO'
}
```

#### ✅ Budget (Presupuesto)
```typescript
{
  number: string,              // 25-00001 (año-consecutivo)
  year: number,                // 2025, 2026...
  consecutive: number,         // 1, 2, 3...
  client: ObjectId,            // Referencia a Client
  contact?: ObjectId,          // Referencia a Contact
  date: Date,                  // Fecha de emisión
  currency: Currency,          // USD, ARS
  validityDays: number,        // Validez oferta (default: 10)
  paymentMethod: string,       // Forma de pago (del cliente)
  status: BudgetStatus,        // APROBADO, EN_ESPERA, NO_APROBADO
  items: [{
    description: string,
    serviceTechnical?: ObjectId, // Link a ST si existe
    equipmentSerialNumber?: string, // N/S del equipo
    quantity: number,
    unitPrice: number,
    totalPrice: number,
    deliveryTime: string       // Plazo por ítem
  }],
  subtotal: number,
  taxes: number,
  total: number,
  notes: {                     // Notas por defecto
    fiscalConditions: boolean,
    billing: boolean,
    offerValidity: boolean,
    isRental: boolean,
    rentalNote: boolean,
    isCalibrationOrMaintenance: boolean,
    calibrationWarranty: boolean,
    transport: boolean,
    deliveryPlace: boolean,
    authorizedCalibrations: boolean,
    deliveryTime: boolean,
    isSaleNationalized: boolean,
    isSaleImported: boolean,
    saleWarranty: boolean
  },
  pdf?: string                 // URL del PDF generado
}

enum Currency {
  USD = 'USD',
  ARS = 'ARS'
}

enum BudgetStatus {
  APROBADO = 'APROBADO',
  EN_ESPERA = 'EN_ESPERA',
  NO_APROBADO = 'NO_APROBADO'
}
```

#### ✅ Remittance (Remito)
```typescript
{
  number: string,              // Número pre-impreso con CAI
  date: Date,                  // Fecha
  client: ObjectId,            // Referencia a Client
  address: string,             // Domicilio
  city: ObjectId,              // Ciudad
  province: string,            // Provincia
  postalCode: string,          // CP
  clientPhone: string,         // Teléfono cliente
  deliveryTime: string,        // Horario entrega
  taxCondition: string,        // Condición IVA
  cuit: string,                // CUIT
  transport: string,           // Transporte
  transportPhone: string,      // Teléfono transporte
  deliverTo: string,           // Entregar en
  purchaseOrder?: string,      // Orden de compra
  budget?: ObjectId,           // Presupuesto asociado
  freight: number,             // Flete
  packages: number,            // Cantidad de bultos
  declaredValue: number,       // Valor declarado
  items: [{
    serviceTechnical?: ObjectId, // ST asociado
    description: string,       // Descripción editable
    quantity: number
  }],
  serviceTechnicals: [ObjectId], // STs incluidos en este remito
  pdf?: string                 // URL del PDF generado
}
```

#### ✅ CalibrationRecord (Registro de Calibraciones con Patrones)
```typescript
{
  equipment: ObjectId,         // Equipo calibrado
  certificate: ObjectId,       // Certificado generado
  standardEquipments: [ObjectId], // Patrones utilizados
  technician: ObjectId,        // Usuario técnico
  calibrationDate: Date,       // Fecha de calibración
  observations?: string
}
```

### 1.2 Modificaciones a Equipment (Instrumento)

**Agregar campos:**
```typescript
{
  // NUEVOS CAMPOS
  serviceTechnical: ObjectId,  // Referencia a ServiceTechnical
  orderNumber: number,         // Nº de orden dentro del ST (1, 2, 3...)
  serviceType: ServiceType,    // PARA_CALIBRAR / REPARAR
  contact: ObjectId,           // Referencia a Contact
  tagNumber: string,           // Nº de TAG
  instanceStatus: InstanceStatus, // EN_PROCESO, CALIBRADO, VERIFICADO, etc.
  expirationStatus: ExpirationStatus, // VIGENTE, PROXIMO_VENCER, VENCIDO
  
  // MANTENER EXISTENTES
  serialNumber: string,
  customSerialNumber?: string,
  model: ObjectId,
  office: ObjectId,
  instrumentType: ObjectId,
  label?: string,
  range?: string,
  description?: string,
  calibrationDate?: Date,
  calibrationExpirationDate?: Date,
  certificate?: string,
  qr?: string,
  outOfService?: boolean
}

enum ServiceType {
  PARA_CALIBRAR = 'PARA_CALIBRAR',
  REPARAR = 'REPARAR'
}

enum InstanceStatus {
  EN_PROCESO = 'EN_PROCESO',
  CALIBRADO = 'CALIBRADO',
  VERIFICADO = 'VERIFICADO',
  REPARADO = 'REPARADO',
  FUERA_DE_SERVICIO = 'FUERA_DE_SERVICIO',
  DEVOLUCION_SIN_CALIBRACION = 'DEVOLUCION_SIN_CALIBRACION'
}

enum ExpirationStatus {
  VIGENTE = 'VIGENTE',
  PROXIMO_VENCER = 'PROXIMO_VENCER', // 60 días
  VENCIDO = 'VENCIDO'
}
```

### 1.3 Modificaciones a Client

**Agregar campos:**
```typescript
{
  // EXISTENTES
  socialReason: string,
  cuit: string,
  responsable?: string,
  phoneNumber?: string,
  city: ObjectId,
  
  // NUEVOS
  address: string,             // Dirección
  postalCode: string,          // CP
  paymentMethod: string,       // Forma de pago por defecto
  province?: string            // Provincia (clarificar con sucursales)
}
```

---

## 🏗️ Fase 2: Nuevos Módulos Backend

### 2.1 service-technical (Servicio Técnico)
**Prioridad: ALTA** | **Dependencias: contacts, equipment modificado**

**Funcionalidades:**
- CRUD de servicios técnicos
- Asignación automática de número consecutivo
- Gestión de estados del servicio
- Vinculación con equipos (1:N)
- Filtros avanzados (N/S, Cliente, Sucursal, Marca, Estado, Vigencia)
- Cambio de estado con validaciones
- Historial de cambios de estado
- Notificación por email (una por ST completo)
- Vista de "pendientes" vs "historial"
- Cálculo automático de estado de vigencia (60 días)
- Gestión de información de laboratorio externo

**Endpoints principales:**
```
POST   /service-technical/create
GET    /service-technical/list
GET    /service-technical/:id
PATCH  /service-technical/:id/update
PATCH  /service-technical/:id/change-status
GET    /service-technical/pending
GET    /service-technical/history
POST   /service-technical/notify-reception
POST   /service-technical/notify-retire
POST   /service-technical/bulk-notify
GET    /service-technical/export-excel
```

### 2.2 contacts (Contactos)
**Prioridad: ALTA** | **Dependencias: clients, offices**

**Funcionalidades:**
- CRUD de contactos
- Vinculación con cliente y sucursal
- Búsqueda por área, cliente, sucursal
- Activación/desactivación de contactos

**Endpoints principales:**
```
POST   /contacts/create
GET    /contacts/list
GET    /contacts/by-client/:clientId
GET    /contacts/by-office/:officeId
PATCH  /contacts/:id/update
DELETE /contacts/:id/deactivate
```

### 2.3 standard-equipment (Equipos Patrones)
**Prioridad: MEDIA** | **Dependencias: brands, models**

**Funcionalidades:**
- CRUD de equipos patrones
- Subida de certificados
- Historial de certificados
- Alertas de vencimiento (email automático)
- Actualización de certificado vencido
- Vinculación con calibraciones realizadas
- Estado automático según fecha de vencimiento

**Endpoints principales:**
```
POST   /standard-equipment/create
GET    /standard-equipment/list
GET    /standard-equipment/:id
PATCH  /standard-equipment/:id/update
POST   /standard-equipment/:id/upload-certificate
GET    /standard-equipment/:id/certificate-history
GET    /standard-equipment/expiring-soon
POST   /standard-equipment/notify-expiration
```

### 2.4 rental-equipment (Equipos de Alquiler)
**Prioridad: MEDIA** | **Dependencias: brands, models, clients**

**Funcionalidades:**
- CRUD de equipos de alquiler
- Gestión de estados (Alquilado, Disponible, Reservado, Fuera de servicio)
- Historial de alquileres por equipo
- Alertas de vencimiento de calibración
- Alertas de fecha de devolución
- Consulta de disponibilidad
- Reporte de equipos alquilados

**Endpoints principales:**
```
POST   /rental-equipment/create
GET    /rental-equipment/list
GET    /rental-equipment/available
GET    /rental-equipment/:id
PATCH  /rental-equipment/:id/update
POST   /rental-equipment/:id/rent
POST   /rental-equipment/:id/return
GET    /rental-equipment/:id/history
GET    /rental-equipment/expiring-calibrations
GET    /rental-equipment/pending-returns
```

### 2.5 budget (Presupuestos)
**Prioridad: ALTA** | **Dependencias: clients, contacts, service-technical**

**Funcionalidades:**
- CRUD de presupuestos
- Numeración automática por año (25-00001)
- Reset de consecutivo en año nuevo
- Vinculación con ST (cuando ya existe el equipo)
- Vinculación posterior de ST al presupuesto
- Gestión de estados (Aprobado, En espera, No aprobado)
- Moneda USD por defecto
- Validez 10 días por defecto
- Forma de pago tomada del cliente (editable)
- Notas configurables según tipo de servicio
- Generación de PDF con logos y página "Por qué elegirnos"
- Búsqueda por número, cliente, estado

**Endpoints principales:**
```
POST   /budget/create
GET    /budget/list
GET    /budget/:id
PATCH  /budget/:id/update
PATCH  /budget/:id/change-status
POST   /budget/:id/link-service-technical
POST   /budget/:id/generate-pdf
GET    /budget/by-client/:clientId
GET    /budget/by-year/:year
```

### 2.6 remittance (Remitos)
**Prioridad: ALTA** | **Dependencias: clients, service-technical, budget**

**Funcionalidades:**
- CRUD de remitos
- Generación desde ST (múltiples equipos del mismo cliente)
- Generación sin ST (ventas, devoluciones, trabajos en planta)
- Pre-carga de información desde ST
- Edición completa de descripciones
- Cambio de estado de equipos a "Listo para retirar" al generar
- Cambio de estado a "Retirado" al entregar (con fecha editable)
- Generación de PDF para impresión
- Edición de remitos existentes con validaciones

**Endpoints principales:**
```
POST   /remittance/create
POST   /remittance/create-from-st
GET    /remittance/list
GET    /remittance/:id
PATCH  /remittance/:id/update
POST   /remittance/:id/generate-pdf
PATCH  /remittance/:id/mark-ready
PATCH  /remittance/:id/mark-retired
```

### 2.7 calibration-record (Registro de Calibraciones)
**Prioridad: MEDIA** | **Dependencias: equipment, standard-equipment, certificates**

**Funcionalidades:**
- Registro de calibración con patrones utilizados
- Historial de calibraciones por equipo
- Historial de uso de cada patrón
- Vinculación con certificado generado
- Generación automática de última página del certificado con patrones

**Endpoints principales:**
```
POST   /calibration-record/create
GET    /calibration-record/by-equipment/:equipmentId
GET    /calibration-record/by-standard/:standardId
GET    /calibration-record/by-certificate/:certificateId
```

---

## 🔧 Fase 3: Modificaciones a Módulos Existentes

### 3.1 equipment (Instrumentos)

**Cambios en el controller:**
- Modificar creación para incluir serviceTechnical y orderNumber
- Agregar filtros: N/S, Cliente, Sucursal, Marca, Estado, Vigencia
- Agregar endpoint para exportar a Excel
- Agregar endpoint para cambiar instanceStatus
- Agregar endpoint para cálculo automático de expirationStatus
- Modificar listado para mostrar solo "EN_PROCESO" por defecto
- Agregar columnas configurables por usuario

**Nuevos endpoints:**
```
PATCH  /instruments/:id/change-instance-status
GET    /instruments/export-excel
GET    /instruments/by-service-technical/:stId
POST   /instruments/bulk-update-status
GET    /instruments/calculate-expiration-status
```

### 3.2 clients (Clientes)

**Cambios en el controller:**
- Agregar campos: address, postalCode, paymentMethod, province
- Validaciones para CUIT único
- Endpoint para obtener forma de pago por defecto

**Nuevos endpoints:**
```
GET    /clients/:id/payment-method
PATCH  /clients/:id/update-payment-method
```

### 3.3 certificates (Certificados)

**Cambios en el controller:**
- Modificar generación de PDF para incluir última página con patrones
- Vinculación con CalibrationRecord
- Obtener patrones utilizados en la calibración

**Nuevos endpoints:**
```
GET    /certificate/:id/standards-used
POST   /certificate/generate-with-standards
```

### 3.4 email (Emails)

**Nuevos templates:**
- Notificación de recepción de ST (una por ST completo)
- Notificación de retiro de ST
- Alerta de vencimiento de patrones
- Alerta de vencimiento de calibración de alquileres
- Alerta de devolución pendiente de alquileres

**Nuevos endpoints:**
```
POST   /email/send-st-reception
POST   /email/send-st-retire
POST   /email/send-standard-expiration-alert
POST   /email/send-rental-calibration-alert
POST   /email/send-rental-return-alert
```

### 3.5 pdf-generator (Generador de PDFs)

**Nuevos templates:**
- Presupuesto con logos y página "Por qué elegirnos"
- Remito con formato específico
- Certificado con última página de patrones utilizados

**Nuevos endpoints:**
```
POST   /pdf/generate-budget
POST   /pdf/generate-remittance
POST   /pdf/generate-certificate-with-standards
```

---

## 🎨 Fase 4: Frontend / Mejoras UX

### 4.1 Pantalla Principal de Instrumentos

**Cambios:**
- Reorganizar formulario de creación (N/S más abajo)
- Agregar campos de Servicio Técnico
- Agregar selector de tipo de servicio (Calibrar/Reparar)
- Agregar selector de contacto
- Campo para TAG

**Tabla principal:**
- Filtros: N/S, Cliente, Sucursal, Marca, Estado (Instancia + Vigencia), Laboratorio
- Columnas configurables por usuario (guardar preferencias)
- Mostrar por defecto solo "EN_PROCESO"
- Agregar columnas: Fecha estimada, Nº presupuesto, OC, Link Pipe
- Botón "Exportar a Excel"
- Selección múltiple para notificaciones
- Estados con colorcitos diferenciados

### 4.2 Nueva Pantalla: Servicios Técnicos

**Vistas:**
- Pendientes (A retirar / En proceso)
- Historial (Retirados)
- Detalle de ST con todos sus equipos
- Botón "Generar Remito" desde múltiples ST
- Opción de generar remito sin ST
- Cambio de estado masivo

### 4.3 Nueva Pantalla: Presupuestos

**Funcionalidades:**
- Formulario con todos los campos requeridos
- Tabla de ítems editable
- Vinculación de ítems con ST existentes
- Selector de notas por defecto
- Previsualización del PDF
- Cambio de estado (Aprobado/En espera/No aprobado)
- Filtros por año, cliente, estado

### 4.4 Nueva Pantalla: Remitos

**Funcionalidades:**
- Selección de ST del mismo cliente
- Formulario pre-cargado o vacío
- Edición de descripciones
- Generación de PDF
- Cambio de estado automático de equipos
- Registro de fecha de retiro

### 4.5 Nueva Pantalla: Equipos Patrones

**Funcionalidades:**
- CRUD de patrones
- Subida de certificados
- Historial de certificados
- Alertas visuales de vencimiento
- Historial de calibraciones realizadas con cada patrón

### 4.6 Nueva Pantalla: Equipos de Alquiler

**Funcionalidades:**
- CRUD de equipos de alquiler
- Tabla con estados (Alquilado, Disponible, etc.)
- Alertas de vencimiento de calibración
- Alertas de devolución pendiente
- Historial de alquileres por equipo

### 4.7 Mejoras en Clientes

**Cambios:**
- Agregar campos: Dirección, CP, Forma de pago
- Clarificar relación Provincia/Ciudad con sucursales

---

## 🤖 Fase 5: Automatizaciones y Cron Jobs

### 5.1 Cálculo automático de estados de vigencia
**Frecuencia: Diaria**
- Recorrer todos los equipos
- Calcular expirationStatus según fecha de vencimiento
- Actualizar estado: VIGENTE / PROXIMO_VENCER (60 días) / VENCIDO

### 5.2 Notificaciones de equipos próximos a vencer
**Frecuencia: Semanal**
- Agrupar equipos próximos a vencer por ST
- Enviar un email por ST al contacto correspondiente

### 5.3 Alertas de patrones por vencer
**Frecuencia: Semanal**
- Detectar patrones con vencimiento cercano (30 días)
- Enviar email a administradores

### 5.4 Alertas de alquileres
**Frecuencia: Diaria**
- Detectar calibraciones de alquiler próximas a vencer
- Detectar devoluciones pendientes
- Enviar emails correspondientes

### 5.5 Reset de numeración de presupuestos
**Frecuencia: Anual (1 de enero)**
- Incrementar año
- Resetear consecutivo a 1

---

## 📝 Fase 6: Testing y Validación

### 6.1 Tests Unitarios
- Servicios de cada módulo nuevo
- Validaciones de negocio
- Cálculos automáticos

### 6.2 Tests de Integración
- Flujo completo: Creación de ST → Equipos → Certificado → Remito
- Vinculación de presupuestos con ST
- Generación de PDFs
- Envío de emails

### 6.3 Tests E2E
- Flujo de usuario completo desde frontend
- Navegación entre pantallas
- Filtros y búsquedas

---

## 🚀 Fase 7: Deploy y Migración

### 7.1 Migración de Datos
- Script para migrar equipos existentes
- Asignación de estados por defecto
- Creación de contactos desde usuarios existentes
- Validación de integridad

### 7.2 Documentación
- Actualizar ARQUITECTURA.md
- Documentar nuevos endpoints en Swagger
- Manual de usuario para nuevas funcionalidades
- Guía de migración

### 7.3 Deploy
- Backup de BD actual
- Deploy de código nuevo
- Ejecución de migraciones
- Verificación de funcionamiento
- Rollback plan

---

## 📊 Prioridades y Timeline Sugerido

### Sprint 1 (2-3 semanas): Fundación
- ✅ Nuevos schemas: ServiceTechnical, Contact
- ✅ Módulo contacts completo
- ✅ Modificaciones a Equipment
- ✅ Modificaciones a Client
- ✅ Módulo service-technical (básico)

### Sprint 2 (2-3 semanas): Gestión de Servicios
- ✅ service-technical completo (todos los endpoints)
- ✅ Filtros avanzados en equipment
- ✅ Notificaciones de recepción y retiro
- ✅ Exportar a Excel

### Sprint 3 (2-3 semanas): Presupuestos y Remitos
- ✅ Módulo budget completo
- ✅ Módulo remittance completo
- ✅ PDFs de presupuestos y remitos
- ✅ Vinculación entre budget y ST

### Sprint 4 (2 semanas): Patrones y Alquileres
- ✅ Módulo standard-equipment completo
- ✅ Módulo rental-equipment completo
- ✅ Módulo calibration-record
- ✅ Modificación de certificados con patrones

### Sprint 5 (2 semanas): Automatizaciones
- ✅ Cron jobs de vigencia
- ✅ Cron jobs de notificaciones
- ✅ Alertas de patrones y alquileres

### Sprint 6 (2 semanas): Testing y Deploy
- ✅ Tests completos
- ✅ Scripts de migración
- ✅ Documentación
- ✅ Deploy a producción

**Timeline Total Estimado: 12-14 semanas (3-3.5 meses)**

---

## ⚠️ Riesgos y Consideraciones

### Riesgos Técnicos
1. **Migración de datos existentes**: Requiere script cuidadoso para no perder información
2. **Cambios en modelo de Equipment**: Impacto en funcionalidades existentes
3. **Integración con AWS S3/SES**: Validar límites y costos
4. **Numeración de presupuestos**: Garantizar unicidad y concurrencia

### Consideraciones de Negocio
1. **Capacitación de usuarios**: Nueva interfaz y flujos de trabajo
2. **Transición gradual**: Considerar período de convivencia de sistemas
3. **Backup y rollback**: Plan B en caso de problemas

### Dependencias Externas
1. **Remitos pre-impresos con CAI**: Integración con sistema de facturación
2. **Logos de empresas distribuidas**: Obtener archivos de alta calidad
3. **Texto "Por qué elegirnos"**: Definir contenido con cliente

---

## 📌 Próximos Pasos Inmediatos

1. ✅ **Revisar y aprobar este plan** con el cliente
2. ✅ **Priorizar funcionalidades** si hay restricciones de tiempo
3. ✅ **Definir alcance de MVP** (Minimum Viable Product)
4. ✅ **Setup del ambiente de desarrollo**
5. ✅ **Comenzar Sprint 1**: Schemas y módulos base

---

## 📞 Consultas Pendientes con Cliente

### Clientes y Sucursales
- ¿Cómo funciona la relación Provincia/Ciudad con sucursales?
- En el caso de TGS, ¿casa central vs sucursales?

### Presupuestos
- ¿Plazo de entrega por ítem o total? (pueden ser varios plazos)
- Confirmar diseño del PDF y logos a incluir
- Definir contenido de página "Por qué elegirnos"

### Remitos
- ¿Validaciones específicas al editar remitos generados?
- ¿Qué sucede si se edita un remito después de retirado?

### Notificaciones
- ¿Frecuencia de alertas de vencimiento? (Semanal, cada 3 días, etc.)
- ¿Enviar copia a administradores?

### Alquileres
- ¿Proceso de reserva de equipos?
- ¿Tarifas de alquiler? ¿Se facturan automáticamente?

---

## 🎯 Métricas de Éxito

- ✅ Reducción del 80% en tiempo de gestión de servicios técnicos
- ✅ Notificaciones automáticas funcionando (0% emails manuales)
- ✅ Generación de presupuestos en <5 minutos
- ✅ Trazabilidad completa equipo → patrón → certificado
- ✅ 0 equipos sin notificar vencimiento
- ✅ 100% de remitos vinculados a ST
- ✅ Dashboard con métricas de negocio

---

**Documento creado:** 16 de enero de 2026  
**Versión:** 1.0  
**Próxima revisión:** Después de Sprint 1
