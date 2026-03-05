# SLA Tracking — Diseño

**Fecha:** 2026-03-05
**Estado:** Aprobado

---

## Contexto

El laboratorio tiene una política de **7 días hábiles** para completar el servicio de cada equipo que entra a calibrar en ITM. Este diseño establece cómo rastrear ese plazo dentro del sistema.

---

## Reglas de negocio

| Regla | Definición |
|---|---|
| SLA estándar | 7 días hábiles |
| Inicio del plazo | `createdAt` del equipo en la OT (cuando entra al sistema) |
| Fin del plazo | Cuando se registra el resultado técnico (CALIBRATED, VERIFIED, MAINTENANCE, OUT_OF_SERVICE, RETURN_WITHOUT_CALIBRATION) |
| Pausa del plazo | Mientras el equipo está en estado FRENADO (BLOCKED) — el lab no tiene control |
| Días hábiles | Excluye fines de semana (sábado y domingo). Feriados a incorporar en el futuro. |
| Urgencia manual | Segunda fase, a definir. |

---

## Modelo de datos

### Filosofía

- **Raíz del equipo** = estado actual (se sobrescribe con cada acción)
- **`serviceHistory[]`** = registro permanente de cada visita, con sus propios datos SLA y mini-historial de acciones

### Campos SLA dentro de cada entrada de `serviceHistory`

```
serviceHistory[n]:
  slaBlockedDays:  number    // días hábiles acumulados en BLOCKED en esta visita (default: 0)
  slaBlockedSince: Date?     // cuándo empezó el freno actual (null si no está frenado)
  slaCompletedAt:  Date?     // cuándo se registró el resultado técnico
  slaMetOnTime:    boolean?  // si se completó dentro de los 7 días hábiles
```

### Campos en la raíz (para acceso rápido)

```
certificateNumber: string?   // número del último certificado emitido
```

### `actionHistory` — movido dentro de cada entrada de `serviceHistory`

Cada visita tiene su propio array de acciones. Esto evita crecimiento ilimitado en el documento y mantiene el historial de acciones asociado a su contexto correcto.

---

## Ciclo de vida del SLA

```
Equipo entra a OT
      │
      ▼
[slaBlockedDays = 0, slaBlockedSince = null]
      │
      ▼
Técnico trabaja → días hábiles corren
      │
      ├── FRENADO → slaBlockedSince = ahora
      │       │
      │       └── DESFRENADO → slaBlockedDays += businessDays(slaBlockedSince, ahora)
      │                        slaBlockedSince = null
      │
      └── RESULTADO REGISTRADO
              slaCompletedAt = ahora
              díasEfectivos = businessDays(entryDate, ahora) − slaBlockedDays
              slaMetOnTime = díasEfectivos ≤ 7
```

---

## Cálculo de estado SLA (en cualquier momento)

```
díasEfectivos = businessDays(entryDate, ahora) − slaBlockedDays

restantes = 7 − díasEfectivos

VERDE   → restantes > 2
AMARILLO → restantes 1–2
ROJO    → restantes ≤ 0 (vencido)
GRIS    → slaCompletedAt != null (terminado — con indicador si fue a tiempo o no)
```

---

## Ejemplo real — equipo con 2 visitas

```
EQUIPO (raíz)
  serialNumber: "ABC-123"
  logisticState: "DELIVERED"        ← estado actual
  technicalState: "CALIBRATED"      ← estado actual
  certificateNumber: "C-2026-33"    ← más reciente

  serviceHistory: [
    {                               // VISITA 1 — 2024
      serviceOrder: OT-24-0010-1
      entryDate: 2024-03-01
      exitDate:  2024-03-07
      technicalResult: "CALIBRATED"
      technicianName: "Carlos López"
      certificateNumber: "C-2024-11"
      slaBlockedDays: 0
      slaMetOnTime: true            // 5 días hábiles
      actionHistory: [
        { action: "IN_LABORATORY", at: 2024-03-02, by: "Ana" },
        { action: "CALIBRATED",    at: 2024-03-06, by: "Carlos" },
        { action: "DELIVERED",     at: 2024-03-07, by: "Ana" }
      ]
    },
    {                               // VISITA ACTUAL — 2026, en curso
      serviceOrder: OT-26-0001-1
      entryDate: 2026-03-01
      exitDate:  null
      technicalResult: null
      slaBlockedDays: 0
      slaBlockedSince: null
      slaMetOnTime: null
      actionHistory: [
        { action: "IN_LABORATORY", at: 2026-03-02, by: "Ana" }
      ]
    }
  ]
```

---

## Búsqueda por número de certificado

Los números de certificado se almacenan en `serviceHistory[].certificateNumber`. MongoDB puede buscar en arrays anidados con un índice multikey:

```
db.equipments.createIndex({ "serviceHistory.certificateNumber": 1 })
db.equipments.find({ "serviceHistory.certificateNumber": "C-2024-11" })
```

Esto permite encontrar cualquier certificado histórico de forma eficiente.

---

## Dónde se muestra el SLA en la UI

| Lugar | Qué muestra |
|---|---|
| Lista de equipos | Chip de color (verde/amarillo/rojo) con días restantes |
| Detalle del equipo | Card en el sidebar con días restantes, fecha límite estimada |
| Historial de visitas | Indicador por visita de si se cumplió el SLA (✓ a tiempo / ✗ tarde) |
| Dashboard | Widget con equipos en riesgo (amarillo + rojo) — fase siguiente |

---

## Fuera de scope (por ahora)

- Feriados nacionales argentinos
- Urgencia manual por equipo
- Notificaciones automáticas por email/push al acercarse el vencimiento
- SLA diferente por tipo de servicio
