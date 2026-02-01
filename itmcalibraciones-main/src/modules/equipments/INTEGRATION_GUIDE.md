# 🔗 Integración de Patrones (Standards) con Equipos

## 📋 Descripción General

Este módulo permite:

1. **Vincular patrones de calibración** (instrumentos maestros) con equipos durante la calibración
2. **Gestionar el flujo operativo completo** desde recepción hasta entrega
3. **Tracking de equipos en laboratorios externos**
4. **Control de documentación legal** (remitos, certificados)

---

## 🎯 Componentes Disponibles

### 🔬 **Gestión de Calibración**

#### 1. **CalibrationDialog**

Dialog para registrar calibración con selección de patrones.

```tsx
import { CalibrationDialog } from "../equipments/components/CalibrationDialog";

<CalibrationDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  equipment={selectedEquipment}
/>;
```

#### 2. **StandardEquipmentSelector**

Selector multi-selección de patrones (solo ACTIVOS).

```tsx
import { StandardEquipmentSelector } from "../equipments/components/StandardEquipmentSelector";

<StandardEquipmentSelector
  value={selectedStandardIds}
  onChange={setSelectedStandardIds}
/>;
```

#### 3. **UsedStandardsDisplay**

Visualización de patrones usados (compacta o detallada).

```tsx
import { UsedStandardsDisplay } from "../equipments/components/UsedStandardsDisplay";

<UsedStandardsDisplay standards={equipment.usedStandards} compact />;
```

---

### 📦 **Gestión de Flujo Operativo**

#### 4. **MoveToOutputTrayDialog**

Mueve equipo a "Bandeja de Salida" (técnicamente listo, falta admin).

```tsx
import { MoveToOutputTrayDialog } from "../equipments/components/MoveToOutputTrayDialog";

<MoveToOutputTrayDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  equipment={selectedEquipment}
/>;
```

#### 5. **DeliveryDialog**

Registra retiro/entrega al cliente con remito y certificado.

```tsx
import { DeliveryDialog } from "../equipments/components/DeliveryDialog";

<DeliveryDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  equipment={selectedEquipment}
/>;
```

#### 6. **SendToExternalLabDialog**

Envía equipo a laboratorio externo con tracking.

```tsx
import { SendToExternalLabDialog } from "../equipments/components/SendToExternalLabDialog";

<SendToExternalLabDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  equipment={selectedEquipment}
/>;
```

#### 7. **ReturnFromExternalLabDialog**

Registra retorno de laboratorio externo a ITM.

```tsx
import { ReturnFromExternalLabDialog } from "../equipments/components/ReturnFromExternalLabDialog";

<ReturnFromExternalLabDialog
  open={showDialog}
  onClose={() => setShowDialog(false)}
  equipment={selectedEquipment}
/>;
```

#### 8. **LogisticStateBadge**

Badge visual para mostrar estado logístico.

```tsx
import { LogisticStateBadge } from "../equipments/components/LogisticStateBadge";

<LogisticStateBadge state={equipment.logisticState} />;
```

---

## 🔄 Estados Logísticos

### EquipmentLogisticState Enum

```typescript
export enum EquipmentLogisticState {
  RECEIVED = "RECEIVED", // Ingreso
  IN_LABORATORY = "IN_LABORATORY", // En Laboratorio
  OUTPUT_TRAY = "OUTPUT_TRAY", // Bandeja de Salida
  READY_TO_DELIVER = "READY_TO_DELIVER", // Listo para retirar
  DELIVERED = "DELIVERED", // Entregado/Retirado
  ON_HOLD = "ON_HOLD", // En Espera/Frenado
}
```

---

## 🔌 API Endpoints

### 1. **Mover a Bandeja de Salida**

Equipo calibrado, pendiente de documentación administrativa.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "logisticState": "OUTPUT_TRAY",
  "technicalState": "CALIBRATED"
}
```

---

### 2. **Registrar Entrega al Cliente**

Cierre del servicio con documentación legal.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "logisticState": "DELIVERED",
  "retireDate": "2026-02-05T10:00:00Z",
  "remittanceNumber": "R-0001-9999", // ⚠️ OBLIGATORIO
  "certificateNumber": "C-2026-555" // Opcional
}
```

---

### 3. **Enviar a Laboratorio Externo**

Derivación a proveedor externo con tracking.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "location": "EXTERNAL",
  "externalProvider": {
    "providerName": "Viditec",
    "sentDate": "2026-02-01",
    "projectedReturnDate": "2026-02-15",
    "exitNote": "Con accesorios, maletín negro"
  }
}
```

---

### 4. **Retorno de Laboratorio Externo**

Reingreso a ITM después de calibración externa.

**PATCH** `/equipment`

```json
{
  "id": "EQUIPO_ID",
  "location": "ITM",
  "logisticState": "IN_LABORATORY",
  "externalProvider": {
    "providerName": "Viditec",
    "sentDate": "2026-02-01",
    "actualReturnDate": "2026-02-14",
    "exitNote": "Volvió OK"
  }
}
```

---

## 📦 Tipos TypeScript Actualizados

### Equipment

```typescript
export interface Equipment {
  _id: string;
  serialNumber: string;
  model: {
    /* ... */
  };

  // Estados
  technicalState?: string;
  logisticState?: EquipmentLogisticState;
  location?: "ITM" | "EXTERNAL";

  // Fechas
  calibrationDate?: string;
  retireDate?: string;

  // Documentación Legal
  remittanceNumber?: string;
  certificateNumber?: string;

  // Laboratorio Externo
  externalProvider?: ExternalProvider;

  // Patrones Utilizados
  usedStandards?: StandardEquipment[];
}
```

### ExternalProvider

```typescript
export interface ExternalProvider {
  providerName: string;
  sentDate: string;
  projectedReturnDate?: string;
  actualReturnDate?: string;
  exitNote?: string;
}
```

---

## 🚀 Flujo Completo de Operación

### Escenario 1: Calibración Interna en ITM

```tsx
function EquipmentWorkflow() {
  const [equipment, setEquipment] = useState<Equipment>();

  // 1. Equipo llega a ITM
  // logisticState: "RECEIVED"

  // 2. Entra al laboratorio
  // logisticState: "IN_LABORATORY"

  // 3. Técnico calibra y selecciona patrones
  <CalibrationDialog
    equipment={equipment}
    onClose={handleCalibrationComplete}
  />
  // technicalState: "CALIBRATED"
  // usedStandards: ["patrón1", "patrón2"]

  // 4. Espera documentación administrativa
  <MoveToOutputTrayDialog equipment={equipment} />
  // logisticState: "OUTPUT_TRAY"

  // 5. Cliente viene a retirar
  <DeliveryDialog equipment={equipment} />
  // logisticState: "DELIVERED"
  // remittanceNumber: "R-0001-9999"
  // certificateNumber: "C-2026-555"
  // retireDate: "2026-02-05T10:00:00Z"
}
```

---

### Escenario 2: Calibración Externa

```tsx
function ExternalCalibrationWorkflow() {
  const [equipment, setEquipment] = useState<Equipment>();

  // 1. Equipo llega a ITM
  // logisticState: "RECEIVED"

  // 2. Se determina que va a laboratorio externo
  <SendToExternalLabDialog equipment={equipment} />
  // location: "EXTERNAL"
  // externalProvider: { providerName: "Viditec", ... }

  // 3. Equipo vuelve del proveedor
  <ReturnFromExternalLabDialog equipment={equipment} />
  // location: "ITM"
  // logisticState: "IN_LABORATORY"
  // externalProvider.actualReturnDate: "2026-02-14"

  // 4. Control de calidad y entrega
  <MoveToOutputTrayDialog equipment={equipment} />
  <DeliveryDialog equipment={equipment} />
}
```

---

### Escenario 3: Página de Dashboard con Estados

```tsx
import { LogisticStateBadge } from "../equipments/components/LogisticStateBadge";
import { UsedStandardsDisplay } from "../equipments/components/UsedStandardsDisplay";

function EquipmentDashboard() {
  const { data: equipments } = useEquipments();

  return (
    <Box>
      {equipments?.map((equipment) => (
        <Card key={equipment._id}>
          <CardContent>
            {/* Info básica */}
            <Typography variant="h6">
              {equipment.model.brand.name} {equipment.model.name}
            </Typography>
            <Typography variant="caption">
              S/N: {equipment.serialNumber}
            </Typography>

            {/* Estado logístico */}
            <LogisticStateBadge state={equipment.logisticState} />

            {/* Ubicación */}
            {equipment.location === "EXTERNAL" && (
              <Chip
                label={`Externo: ${equipment.externalProvider?.providerName}`}
                color="info"
              />
            )}

            {/* Patrones usados (si está calibrado) */}
            {equipment.usedStandards && (
              <UsedStandardsDisplay
                standards={equipment.usedStandards}
                compact
              />
            )}

            {/* Acciones según estado */}
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {equipment.logisticState === "IN_LABORATORY" && (
                <Button onClick={() => openCalibrationDialog(equipment)}>
                  Calibrar
                </Button>
              )}

              {equipment.technicalState === "CALIBRATED" &&
                equipment.logisticState !== "OUTPUT_TRAY" && (
                  <Button onClick={() => openOutputTrayDialog(equipment)}>
                    Mover a Bandeja
                  </Button>
                )}

              {equipment.logisticState === "OUTPUT_TRAY" && (
                <Button onClick={() => openDeliveryDialog(equipment)}>
                  Registrar Entrega
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **Estados Logísticos**

- `RECEIVED`: Equipo ingresó a ITM, pendiente de asignación
- `IN_LABORATORY`: En proceso de calibración/reparación
- `OUTPUT_TRAY`: Técnicamente listo, falta documentación administrativa
- `READY_TO_DELIVER`: Todo listo, esperando retiro del cliente
- `DELIVERED`: Entregado al cliente, servicio cerrado

### 2. **Ubicación Física**

- `ITM`: Equipo físicamente en ITM
- `EXTERNAL`: Equipo en laboratorio externo

### 3. **Campos Obligatorios para Entrega**

- ✅ `remittanceNumber`: Siempre obligatorio (trazabilidad legal)
- ⚠️ `certificateNumber`: Opcional pero recomendado
- ✅ `retireDate`: Fecha/hora real de retiro

### 4. **Tracking de Externos**

El objeto `externalProvider` mantiene historial completo:

- `sentDate`: Cuándo se envió
- `projectedReturnDate`: Cuándo debería volver
- `actualReturnDate`: Cuándo volvió realmente
- `exitNote`: Observaciones de salida/retorno

### 5. **Validaciones Importantes**

```tsx
// Solo permitir calibración si está en laboratorio
if (equipment.logisticState !== "IN_LABORATORY") {
  // Mostrar error
}

// Solo permitir entrega si tiene remito
if (!equipment.remittanceNumber) {
  // Pedir remito obligatorio
}

// Solo permitir retorno externo si location es EXTERNAL
if (equipment.location !== "EXTERNAL") {
  // No mostrar botón de retorno
}
```

---

## 🎨 Personalización de Badges

```tsx
// Personalizar colores según lógica de negocio
<LogisticStateBadge state={equipment.logisticState} size="small" />;

// Helper para obtener label sin badge
import { getLogisticStateLabel } from "../equipments/components/LogisticStateBadge";

const label = getLogisticStateLabel(equipment.logisticState);
// "En Laboratorio"
```

---

## 🐛 Troubleshooting

### "No puedo mover a OUTPUT_TRAY"

- Verifica que `technicalState` sea "CALIBRATED"
- El equipo debe estar `location: "ITM"`

### "Error al registrar entrega"

- `remittanceNumber` es obligatorio
- `retireDate` debe ser una fecha válida ISO 8601

### "No puedo registrar retorno externo"

- Verifica que `location` sea "EXTERNAL"
- Debe existir `externalProvider` con datos de envío

### "Los patrones no se guardan"

- Verifica que `usedStandards` sea array de IDs (strings)
- Los patrones deben existir y estar ACTIVOS

---

## 📚 Referencias Adicionales

- [Tipos TypeScript](/src/modules/equipments/types/index.ts)
- [API de Equipos](/src/modules/equipments/api/index.ts)
- [Hooks](/src/modules/equipments/hooks/useEquipments.ts)
- [Componentes](/src/modules/equipments/components/)

---

## 🔄 Changelog

### v2.0.0 - Flujo Operativo

- ✅ Agregados estados logísticos completos
- ✅ Sistema de tracking para laboratorios externos
- ✅ Campos legales (remito, certificado)
- ✅ Componentes para cada etapa del flujo
- ✅ Badge visual de estados

### v1.0.0 - Inicial

- ✅ Integración de patrones con calibración
- ✅ Selector de patrones activos
- ✅ Visualización de patrones usados

```tsx
import { CalibrationDialog } from "../equipments/components/CalibrationDialog";
import { UsedStandardsDisplay } from "../equipments/components/UsedStandardsDisplay";

function EquipmentPage() {
  const [calibrationDialog, setCalibrationDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );

  return (
    <>
      {/* Botón para calibrar */}
      <Button
        onClick={() => {
          setSelectedEquipment(equipment);
          setCalibrationDialog(true);
        }}
      >
        Calibrar Equipo
      </Button>

      {/* Dialog de calibración */}
      <CalibrationDialog
        open={calibrationDialog}
        onClose={() => setCalibrationDialog(false)}
        equipment={selectedEquipment}
      />

      {/* Mostrar patrones usados (si el equipo ya está calibrado) */}
      {equipment.usedStandards && equipment.usedStandards.length > 0 && (
        <UsedStandardsDisplay standards={equipment.usedStandards} />
      )}
    </>
  );
}
```

---

### Paso 2: Uso manual en formulario personalizado

```tsx
import { StandardEquipmentSelector } from "../equipments/components/StandardEquipmentSelector";
import { useUpdateEquipment } from "../equipments/hooks/useEquipments";

function CustomCalibrationForm() {
  const [usedStandards, setUsedStandards] = useState<string[]>([]);
  const updateMutation = useUpdateEquipment();

  const handleSubmit = () => {
    updateMutation.mutate({
      id: equipmentId,
      technicalState: "CALIBRATED",
      calibrationDate: new Date().toISOString(),
      usedStandards: usedStandards, // Array de IDs
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... otros campos ... */}

      <StandardEquipmentSelector
        value={usedStandards}
        onChange={setUsedStandards}
      />

      <Button type="submit">Guardar</Button>
    </form>
  );
}
```

---

## ⚠️ Consideraciones Importantes

### 1. **Filtrado de Patrones ACTIVOS**

El componente `StandardEquipmentSelector` filtra automáticamente solo patrones con `status: "ACTIVO"`. Esto evita que técnicos usen patrones vencidos o fuera de servicio.

```tsx
const activeStandards = standards?.filter((s) => s.status === "ACTIVO") || [];
```

### 2. **Validación Obligatoria**

Recomendamos hacer obligatoria la selección de al menos un patrón:

```tsx
<Controller
  name="usedStandards"
  rules={{
    required: "Debes seleccionar al menos un patrón",
    validate: (value) => value.length > 0 || "Selecciona al menos un patrón",
  }}
  // ...
/>
```

### 3. **Población Automática**

Cuando haces GET de un equipo, el backend devuelve `usedStandards` con los objetos completos (populated), no solo IDs. Esto te permite mostrar toda la información sin hacer requests adicionales.

### 4. **Certificados y Trazabilidad**

Esta información es crítica para:

- Imprimir certificados de calibración
- Auditorías ISO 17025
- Trazabilidad metrológica
- Demostrar cadena de calibración a estándares nacionales/internacionales

---

## 🎨 Personalización

### Cambiar el placeholder

```tsx
<StandardEquipmentSelector
  value={standards}
  onChange={setStandards}
  placeholder="Selecciona los instrumentos maestros utilizados"
/>
```

### Versión compacta de visualización

```tsx
<UsedStandardsDisplay standards={equipment.usedStandards} compact />
```

### Sin borde (integrado en otro componente)

```tsx
<Box sx={{ p: 2 }}>
  <Typography variant="caption" color="text.secondary">
    Patrones usados:
  </Typography>
  <UsedStandardsDisplay standards={equipment.usedStandards} compact />
</Box>
```

---

## 📝 Ejemplo Real de Uso

```tsx
// En CreateServiceOrderPage.tsx o similar
import { CalibrationDialog } from "../equipments/components/CalibrationDialog";
import { UsedStandardsDisplay } from "../equipments/components/UsedStandardsDisplay";

export const ServiceOrderDetailPage = () => {
  const { data: equipment } = useEquipment(equipmentId);
  const [showCalibration, setShowCalibration] = useState(false);

  return (
    <Box>
      {/* Estado del equipo */}
      <Chip
        label={equipment.technicalState}
        color={
          equipment.technicalState === "CALIBRATED" ? "success" : "default"
        }
      />

      {/* Botón calibrar (si no está calibrado) */}
      {equipment.technicalState !== "CALIBRATED" && (
        <Button variant="contained" onClick={() => setShowCalibration(true)}>
          Calibrar Equipo
        </Button>
      )}

      {/* Mostrar patrones usados (si ya está calibrado) */}
      {equipment.usedStandards && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Historial de Calibración
          </Typography>
          <UsedStandardsDisplay standards={equipment.usedStandards} />
        </Box>
      )}

      {/* Dialog de calibración */}
      <CalibrationDialog
        open={showCalibration}
        onClose={() => setShowCalibration(false)}
        equipment={equipment}
      />
    </Box>
  );
};
```

---

## 🔍 Testing

Para probar la integración:

1. **Verifica que haya patrones ACTIVOS**: Ve a `/standard-equipment` y crea al menos un patrón con estado ACTIVO
2. **Abre el dialog de calibración**: Debe mostrar la lista de patrones disponibles
3. **Selecciona patrones**: Deben aparecer como chips en el select
4. **Guarda la calibración**: Verifica en Network que se envían los IDs correctos
5. **Verifica la respuesta**: El backend debe devolver `usedStandards` poblado

---

## 🐛 Troubleshooting

### "No hay patrones activos disponibles"

- Verifica que existan patrones en la BD con `status: "ACTIVO"`
- Revisa que el token de autenticación sea válido

### Los patrones no se muestran después de guardar

- Verifica que el backend esté poblando `usedStandards` correctamente
- Chequea que `useQueryClient.invalidateQueries` se esté llamando después del update

### Error 400 al guardar

- Verifica que `usedStandards` sea un array de strings (IDs válidos de Mongo)
- Confirma que el endpoint es `/equipment` (singular) no `/equipments`

---

## 📚 Referencias

- [Módulo de Patrones](/src/modules/standard-equipment/)
- [Hooks de Equipos](/src/modules/equipments/hooks/useEquipments.ts)
- [API de Equipos](/src/modules/equipments/api/index.ts)
