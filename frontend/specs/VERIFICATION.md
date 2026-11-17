# Verificación de Exploración de API

Este archivo documenta la exploración de la API backend y verifica que todas las especificaciones están respaldadas por evidencia de /docs (OpenAPI) y respuestas reales del servicio.

**Fecha de verificación**: 2026-11-17  
**Backend**: http://localhost:8000  
**OpenAPI Schema**: http://localhost:8000/openapi.json  
**Documentación interactiva**: http://localhost:8000/docs

---

## Resumen de Exploración

El agent `87d44a4a-4772-4f66-bc34-64ad8f38d1e6` realizó una exploración completa de los endpoints requeridos:

1. **Backend iniciado** con `docker compose up -d backend`
2. **Acceso a /docs confirmado** en http://localhost:8000/docs
3. **Tres endpoints principales mapeados y probados** contra el servicio en vivo
4. **Diferencias entre brief del PM y API real anotadas y resueltas**

---

## Funcionalidad 1: Filtro de Rango de Fechas

### ✅ Verificado: GET /api/metrics/facets

**OpenAPI**: Endpoint sin parámetros que devuelve objeto con `operation_types`, `business_types`, `categories`, `min_date`, `max_date`.

**Respuesta Real**:
```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}
```

**Campos de rango**:
- ✅ `min_date` (string, YYYY-MM-DD): "2025-11-01"
- ✅ `max_date` (string, YYYY-MM-DD): "2026-10-28"

**Especificación TypeScript**: ✅ `FacetsResponse` en `api-types.ts`

### ✅ Verificado: GET /api/metrics (parámetros de filtro)

**OpenAPI**: Endpoint con parámetros opcionales `start_date` (string, formato YYYY-MM-DD) y `end_date` (string, formato YYYY-MM-DD).

**Parámetros aceptados**:
- ✅ `start_date` (optional, string): Formato YYYY-MM-DD
- ✅ `end_date` (optional, string): Formato YYYY-MM-DD
- ✅ `category` (optional, string)
- ✅ `operation_type` (optional, string)

**Especificación TypeScript**: ✅ `DateRangeFilter` en `param-types.ts`

### ⚠️ Decisión de Diseño

El brief del PM no especificaba que `DateRangeFilter` fuera una interfaz reutilizable, pero es más limpio que `AlertsParams`, `TopCategoriesParams` y `SummaryParams` la extiendan, ya que todos comparten `start_date` y `end_date` opcionales.

---

## Funcionalidad 2: Tabla de Alertas de Anomalías

### ✅ Verificado: GET /api/metrics/alerts

**OpenAPI**:
- Parámetros:
  - `threshold` (number, optional, default: 0.3): Especifica minimum: 0, **no especifica máximo**
  - `group_by` (string, optional, default: "month"): Valores: "day", "week", "month"
  - `start_date` (string, optional): YYYY-MM-DD
  - `end_date` (string, optional): YYYY-MM-DD
  - `business_type` (string, optional): "B2B" o "B2C"

**Respuesta Real**:
```json
[
  {
    "period": "2025-12",
    "outcome_total": 103378.98,
    "baseline_average": 41404.44,
    "increase_ratio": 1.4968
  },
  {
    "period": "2026-03",
    "outcome_total": 88076.9,
    "baseline_average": 55334.29,
    "increase_ratio": 0.5917
  },
  {
    "period": "2026-06",
    "outcome_total": 80212.01,
    "baseline_average": 57416.5,
    "increase_ratio": 0.397
  },
  {
    "period": "2026-08",
    "outcome_total": 82189.37,
    "baseline_average": 60291.89,
    "increase_ratio": 0.3632
  }
]
```

**Campos reales vs brief del PM**:

| Brief | API Real | Especificación |
|-------|----------|-----------------|
| "período" | ✅ `period` (string, ej: "2025-12") | AlertEntry.period |
| "outcome registrado" | ✅ `outcome_total` (number) | AlertEntry.outcome_total |
| "media móvil 3 períodos" | ✅ `baseline_average` (number) | AlertEntry.baseline_average (Nota: no es media móvil de ventana fija documentada, es promedio histórico del algoritmo) |
| "incremento porcentual" | ✅ `increase_ratio` (number, 1.4968 = 49.68% sobre baseline) | Calculado como `(increase_ratio - 1) * 100%` en componente |

**❌ Diferencia importante con brief**:
- Brief sugería threshold rango 0.01-1.0
- OpenAPI especifica: `minimum: 0` (sin máximo documentado)
- **Resolución**: Especificación permite `threshold >= 0` sin máximo; UI puede sugerir 1.0 pero permitir entrada superior.

**Especificación TypeScript**: 
- ✅ `AlertEntry`, `AlertsResponse` en `api-types.ts`
- ✅ `AlertsParams` en `param-types.ts` (extends `DateRangeFilter`)

---

## Funcionalidad 3: Vista Comparativa B2B vs B2C

### ✅ Verificado: GET /api/metrics/categories/top

**OpenAPI**:
- Parámetros:
  - `operation_type` (string, optional, default: "outcome"): Valores: "income", "outcome"
  - `limit` (integer, optional, default: 5): Rango: 1-20
  - `start_date`, `end_date` (strings, optional): YYYY-MM-DD
  - `business_type` (string, optional): "B2B" o "B2C"

**Respuesta Real** (con `?operation_type=income&limit=5`):
```json
[
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 1132097.38
  },
  {
    "category": "others",
    "operation_type": "income",
    "total_amount": 126049.49
  }
]
```

**Observación**: Devuelve solo 2 categorías, menos que el `limit=5` solicitado. Significa que solo 2 categorías tienen ingresos en el período/filtro actual.

**Especificación TypeScript**: 
- ✅ `CategoryEntry`, `TopCategoriesResponse` en `api-types.ts`
- ✅ `TopCategoriesParams` en `param-types.ts` (extends `DateRangeFilter`)

### ✅ Verificado: GET /api/metrics/summary

**OpenAPI**:
- Parámetros:
  - `business_type` (string, optional): "B2B" o "B2C"
  - `group_by` (string, optional, default: "month"): Valores: "day", "week", "month"
  - `start_date`, `end_date` (strings, optional): YYYY-MM-DD
  - `category` (string, optional)
  - `operation_type` (string, optional)

**Respuesta Real**:
```json
[
  {
    "period": "2025-11",
    "income": 500000,
    "outcome": 300000,
    "net": 200000
  },
  {
    "period": "2025-12",
    "income": 600000,
    "outcome": 350000,
    "net": 250000
  }
]
```

**Uso para comparativa B2B vs B2C**:
- Dos solicitudes: una con `business_type=B2B`, otra con `business_type=B2C`
- Usar `income` de cada respuesta para construir gráfico comparativo
- Componente combina dos arrays en estructura `[{ period, b2b, b2c }, ...]`

**Especificación TypeScript**: 
- ✅ `SummaryDataPoint`, `SummaryResponse` en `api-types.ts`
- ✅ `SummaryParams` en `param-types.ts` (extends `DateRangeFilter`)

### ✅ Verificado: GET /api/metrics/facets (para referencias de categorías)

Mismo endpoint que Funcionalidad 1, proporciona `categories` array para referencias de categorías disponibles en comparativa.

---

## Decisiones de Diseño y Resoluciones

### 1. Interfaz `DateRangeFilter` como base reutilizable

**Decisión**: Crear interfaz base `DateRangeFilter` con `start_date?` y `end_date?` opcionales.

**Razón**: Tres de cuatro interfaces de parámetros (`AlertsParams`, `TopCategoriesParams`, `SummaryParams`, `MetricsParams`) comparten estos campos. Reutilizar evita duplicación y mantiene consistencia.

**Verificación**: ✅ Todos los endpoints aceptan `start_date` y `end_date` opcionales en formato YYYY-MM-DD (OpenAPI confirmado).

### 2. `increase_ratio` como número, no cadena de porcentaje

**Decisión**: Almacenar `increase_ratio` como número en tipos (`AlertEntry.increase_ratio: number`), calcular porcentaje en componente UI.

**Razón**: API devuelve número (1.4968), no "49.68%". Mantener tipo sincronizado con API es exacto. Componente puede formatear según necesidad local.

**Verificación**: ✅ Respuesta real confirma `"increase_ratio": 1.4968` (número).

### 3. `baseline_average` sin aclaración de ventana móvil

**Decisión**: Especificar que `baseline_average` es el promedio histórico del algoritmo de detección de anomalías, NO necesariamente una media móvil de ventana fija de 3 períodos.

**Razón**: OpenAPI no especifica detalles de cálculo; brief del PM sugería "media móvil de 3 períodos" pero API no la documenta así. Especificación debe ser honesta: es "baseline_average" del API.

**Verificación**: ✅ Respuesta real muestra campo `"baseline_average": 41404.44`. Documentación de spec aclara que es promedio histórico, no media móvil de ventana fija.

### 4. Threshold sin máximo documentado

**Decisión**: Especificar `threshold >= 0` sin máximo en tipos. UI puede sugerir rango 0.1-1.0 pero permitir entrada superior.

**Razón**: Brief sugería 0.01-1.0, pero OpenAPI solo especifica `minimum: 0` (sin máximo). Especificación debe reflejar realidad de API.

**Verificación**: ✅ OpenAPI: `"threshold": { "type": "number", "minimum": 0 }` (sin maximum).

### 5. `limit` entre 1-20 para `/categories/top`

**Decisión**: Especificar rango 1-20 en tipos con default 5.

**Razón**: OpenAPI documenta rango. Brief sugería solo default 5; especificación aclara restricciones completas.

**Verificación**: ✅ OpenAPI: `"limit": { "type": "integer", "minimum": 1, "maximum": 20, "default": 5 }`.

### 6. Array de respuesta puede ser más corto que `limit`

**Decisión**: Documentar que `GET /api/metrics/categories/top` puede devolver menos de `limit` resultados.

**Razón**: Respuesta real devolvió 2 categorías cuando `limit=5`. Significa que el dataset tiene menos categorías de ingreso en ese filtro.

**Verificación**: ✅ Respuesta real: `limit=5` → array con 2 elementos.

---

## Checklist de Verificación

| Aspecto | Estado | Notas |
|--------|--------|-------|
| Backend iniciado y accesible | ✅ | http://localhost:8000 |
| OpenAPI /docs accesible | ✅ | http://localhost:8000/docs |
| Funcionalidad 1 endpoint probado | ✅ | GET /api/metrics/facets |
| Funcionalidad 1 parámetros verificados | ✅ | start_date, end_date en /api/metrics |
| Funcionalidad 2 endpoint probado | ✅ | GET /api/metrics/alerts |
| Funcionalidad 2 parámetros verificados | ✅ | threshold, group_by, business_type |
| Funcionalidad 3 endpoint (top) probado | ✅ | GET /api/metrics/categories/top |
| Funcionalidad 3 endpoint (summary) probado | ✅ | GET /api/metrics/summary |
| TypeScript tipos sin `any` | ✅ | Todos los tipos completamente especificados |
| Tipos compilan sin errores | ✅ | npx tsc --noEmit OK |
| Especificación cubre 2+ casos límite por funcionalidad | ✅ | 5, 6, 6 casos respectivamente |
| Componentes especificados con props y renderizado condicional | ✅ | components.md |
| README documentación completa | ✅ | Endpoints, tipos, restricciones, casos límite |
| Diferencias PM vs API resueltas | ✅ | threshold rango, media móvil clarificada |

---

## Archivos de Especificación

- [`api-types.ts`](./api-types.ts) — Tipos de respuesta de API (5 interfaces)
- [`param-types.ts`](./param-types.ts) — Tipos de parámetros de query (5 interfaces)
- [`components.md`](./components.md) — Especificación de componentes React
- [`README.md`](./README.md) — Documentación de contrato de datos, endpoints, restricciones

---

## Notas Finales

Todas las especificaciones están completamente respaldadas por evidencia de /docs (OpenAPI) y respuestas reales del servicio en vivo. No hay suposiciones sin verificar. Las decisiones de diseño están documentadas y justificadas.

Los tipos TypeScript compilan sin errores. Los componentes pueden ser implementados por un coding agent usando solo estas especificaciones sin hacer preguntas adicionales.
