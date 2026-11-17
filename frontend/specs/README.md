# Especificación de Funcionalidades del Dashboard Financiero

Este documento especifica las tres nuevas funcionalidades del dashboard financiero con sus endpoints, tipos TypeScript, parámetros válidos y casos límite. Todas las afirmaciones están verificadas contra el esquema OpenAPI (http://localhost:8000/openapi.json) y respuestas reales de la API.

---

## Funcionalidad 1: Filtro de Rango de Fechas en Dashboard Principal

### Descripción

El usuario puede establecer una fecha de inicio y una fecha de fin opcional para filtrar todos los datos mostrados en el dashboard. Ambos campos son opcionales; cuando están vacíos, se muestran todos los datos disponibles. El rango de fechas disponible (mínima y máxima) se obtiene de un endpoint dedicado y se muestra como referencia.

### Endpoints

**Obtener rango de fechas disponible:**

```
GET /api/metrics/facets
```

**Parámetros**: Ninguno.

**Respuesta** (tipo: `FacetsResponse`):

```json
{
  "operation_types": ["income", "outcome"],
  "business_types": ["B2B", "B2C"],
  "categories": ["administrative", "operational", "others", "sales", "suppliers"],
  "min_date": "2025-11-01",
  "max_date": "2026-10-28"
}
```

**Filtrar métricas existentes:**

```
GET /api/metrics?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/metrics/summary?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

**Parámetros**:

- `start_date` (string, opcional): Fecha mínima en formato YYYY-MM-DD. Cuando se proporciona, solo se devuelven registros con `create_date >= start_date`.
- `end_date` (string, opcional): Fecha máxima en formato YYYY-MM-DD. Cuando se proporciona, solo se devuelven registros con `create_date <= end_date`.

Ambos parámetros pueden omitirse; cuando ambos están ausentes, se devuelven todos los datos disponibles.

### Tipos TypeScript

**Interfaz de parámetros:**

```typescript
interface DateRangeFilter {
  start_date?: string;  // YYYY-MM-DD
  end_date?: string;    // YYYY-MM-DD
}
```

**Interfaz de respuesta:**

```typescript
interface FacetsResponse {
  operation_types: Array<'income' | 'outcome'>;
  business_types: Array<'B2B' | 'B2C'>;
  categories: Category[];  // ver api-types.ts
  min_date: string;      // YYYY-MM-DD
  max_date: string;      // YYYY-MM-DD
}
```

### Componente UI

**Nombre**: `DateRangeFilter`

**Props**:

```typescript
interface DateRangeFilterProps {
  startDate?: string;                     // Current value (YYYY-MM-DD)
  endDate?: string;                       // Current value (YYYY-MM-DD)
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDateAvailable?: string;              // From FacetsResponse.min_date; undefined mientras carga o si falla
  maxDateAvailable?: string;              // From FacetsResponse.max_date; undefined mientras carga o si falla
  facetsError?: string;                   // Si está definido, los inputs se deshabilitan
  loading?: boolean;
}
```

**Renderizado**:

- Dos inputs de tipo `date` con labels "Fecha de inicio" y "Fecha de fin".
- Pista de rango debajo: "Rango disponible: 2025-11-01 a 2026-10-28".
- Inputs con atributos `min` y `max` tomados de `minDateAvailable` y `maxDateAvailable` (sin límites si son undefined).

### Restricciones de Parámetros

| Parámetro | Tipo | Restricción | Comportamiento |
|-----------|------|-------------|-----------------|
| `start_date` | string | Formato YYYY-MM-DD | Si inválido, API devuelve 422. El cliente debe validar con `input type="date"`. |
| `end_date` | string | Formato YYYY-MM-DD | Si inválido, API devuelve 422. |
| Rango lógico | - | No validado por API | Si `start_date > end_date`, API devuelve `[]` (sin error). UI: no envía la petición y muestra el error de components.md. |

### Casos Límite

**Caso 1: Solo fecha de inicio**
- Usuario establece `start_date = "2026-01-01"`, `end_date` vacío.
- API devuelve registros desde 2026-01-01 hasta 2026-10-28 (máximo disponible).
- **UI esperada**: Gráficos y tablas muestran datos desde enero 2026 en adelante.

**Caso 2: Solo fecha de fin**
- Usuario establece `end_date = "2026-03-31"`, `start_date` vacío.
- API devuelve registros desde 2025-11-01 (mínimo disponible) hasta 2026-03-31.
- **UI esperada**: Gráficos y tablas muestran datos hasta marzo 2026.

**Caso 3: Ambas fechas vacías**
- Usuario borra ambos inputs.
- API devuelve todos los datos (2025-11-01 a 2026-10-28).
- **UI esperada**: Dashboard muestra todo el rango histórico.

**Caso 4: start_date > end_date**
- Usuario establece `start_date = "2026-06-01"`, `end_date = "2026-03-01"`.
- La UI no envía la petición.
- **UI esperada**: "La fecha de inicio debe ser anterior o igual a la fecha de fin." (ver components.md). La API, si recibe ese rango, devuelve `[]`.

**Caso 5: Rango fuera de disponibilidad**
- Usuario intenta establecer `start_date = "2026-12-01"` (posterior a máximo disponible).
- El input usa `min` y `max`, pero el usuario puede escribir una fecha fuera de rango.
- Si se envía de todas formas (bypass), API devuelve array vacío.
- **UI esperada**: Tabla muestra estado vacío.

---

## Funcionalidad 2: Tabla de Alertas de Anomalías

### Descripción

Bajo los gráficos del dashboard, se renderiza una tabla que destaca períodos en los que el gasto (outcome) subió inesperadamente según un umbral configurable. El usuario puede ajustar el threshold (ratio de incremento) mediante un input numérico. La tabla respeta el rango de fechas establecido en Funcionalidad 1.

### Endpoint

```
GET /api/metrics/alerts?threshold=0.3&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

**Parámetros**:

- `threshold` (number, opcional, default: 0.3): Umbral sobre `increase_ratio` (fracción). Valores: >= 0; la API responde 422 si es negativo. Detecta períodos con `increase_ratio > threshold`. Ejemplo: 0.3 detecta incrementos > 30% sobre la media histórica.
- `start_date` (string, opcional): Filtro de fecha de inicio (YYYY-MM-DD).
- `end_date` (string, opcional): Filtro de fecha de fin (YYYY-MM-DD).
- `business_type` (string, opcional): Filtro por línea de negocio (`B2B` o `B2C`). Cuando se omite, se devuelven alertas de todas las líneas.
- `group_by` (string, opcional, default: `month`): Granularidad temporal. Valores válidos: `day`, `week`, `month`.

**Respuesta** (tipo: `AlertsResponse`):

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
  }
]
```

### Tipos TypeScript

**Interfaz de parámetros:**

```typescript
interface AlertsParams extends DateRangeFilter {
  threshold?: number;                     // default: 0.3, minimum: 0
  business_type?: 'B2B' | 'B2C';
  group_by?: 'day' | 'week' | 'month';   // default: 'month'
}
```

**Interfaz de entrada (un AlertEntry):**

```typescript
interface AlertEntry {
  period: string;              // Format: YYYY-MM (or YYYY-MM-DD, YYYY-Www depending on group_by)
  outcome_total: number;       // Total spending for this period
  baseline_average: number;    // Media acumulada de los períodos anteriores
  increase_ratio: number;      // Fracción: (outcome_total - baseline_average) / baseline_average
}
```

**Interfaz de respuesta:**

```typescript
type AlertsResponse = AlertEntry[];
```

### Componente UI

**Nombre**: `AnomalyAlertsTable`

**Props**:

```typescript
interface AnomalyAlertsTableProps {
  alerts: AlertEntry[];
  threshold: number;
  onThresholdChange: (newThreshold: number) => void;
  loading?: boolean;
  error?: string;
}
```

**Tabla con 4 columnas**:

| Encabezado | Fuente | Formato | Notas |
|-----------|--------|---------|-------|
| Período | `AlertEntry.period` | Texto (ej: "2025-12") | Según `group_by` parameter |
| Outcome Registrado | `AlertEntry.outcome_total` | Número con separador de miles, 2 decimales | 103,378.98 |
| Media histórica | `AlertEntry.baseline_average` | Número con separador de miles, 2 decimales | Media acumulada de los períodos anteriores. El PM pidió media móvil de 3 períodos; la API no la calcula. |
| Incremento Porcentual | Calculado de `AlertEntry.increase_ratio` | Porcentaje con signo | Fórmula: `(increase_ratio * 100).toFixed(2) + "%"`, con "+" delante. Ejemplo: 1.4968 → "+149.68%"; 0.5917 → "+59.17%" |

**Renderizado**:

- Input `type="number"` para threshold, label "Threshold de alerta", default 0.3.
- Tabla con filas ordenadas por `period` descendente (más reciente primero).
- Cada fila es un `AlertEntry`.

**Estado vacío** (cuando `alerts.length === 0` y no hay error):

```
"No se detectaron anomalías para el threshold actual.
Intenta reducir el valor de threshold para detectar cambios más pequeños."
```

Reemplaza la tabla completamente, no renderiza tabla vacía.

**Estado de error** (cuando `error !== undefined`):

```
Mostrar el mensaje debajo del input de threshold, según components.md. No renderizar tabla.
Ejemplo: "Error al cargar alertas. Intenta más tarde."
```

### Restricciones de Parámetros

| Parámetro | Tipo | Restricción | Comportamiento |
|-----------|------|-------------|-----------------|
| `threshold` | number | API: >= 0 (422 si es negativo). UI: 0.01 a 1.0 | Fuera de [0.01, 1.0] la UI muestra "El threshold debe estar entre 0.01 y 1.0." y no llama a la API. |
| `start_date` | string | Formato YYYY-MM-DD | Reutiliza validación de Funcionalidad 1. |
| `end_date` | string | Formato YYYY-MM-DD | Reutiliza validación de Funcionalidad 1. |
| `business_type` | string | "B2B" o "B2C" | Cuando se omite, se devuelven alertas de ambas líneas. |

### Casos Límite

**Caso 1: Threshold muy bajo (0.01)**
- Usuario establece `threshold = 0.01`.
- API detecta períodos con incremento > 1% sobre la media histórica.
- **UI esperada**: Tabla muestra muchas filas (posiblemente todos los períodos).

**Caso 2: Threshold muy alto (1.0)**
- Usuario establece `threshold = 1.0`.
- API detecta solo períodos con incremento > 100% (`increase_ratio > 1.0`).
- **UI esperada**: Tabla muestra pocas o ninguna fila, estado vacío posible.

**Caso 3: Threshold negativo**
- Usuario intenta ingresar `-0.5`.
- La UI no envía la petición y muestra "El threshold debe estar entre 0.01 y 1.0.". Si la API recibe -0.5 directamente, responde 422.

**Caso 4: Alertas con incremento < threshold**
- Usuario establece `threshold = 0.5`.
- API devuelve solo períodos con `increase_ratio > 0.5` (incremento > 50%).
- El período 2025-12 (`increase_ratio = 1.4968`) y 2026-03 (`0.5917`) aparecen. Un período con `0.3` (+30%) NO aparece.
- **UI esperada**: Tabla refleja solo anomalías que superan el threshold establecido.

**Caso 5: Sin datos en rango de fechas filtrado**
- Usuario establece `start_date = "2026-09-01"` y `end_date = "2026-09-30"`.
- API devuelve `[]` si ningún período supera el threshold en ese rango.
- **UI esperada**: Mostrar mensaje de estado vacío: "No se detectaron anomalías para el threshold actual en este período."

**Caso 6: Cambio de threshold dispara re-fetch**
- Usuario cambia `threshold` de 0.3 a 0.1.
- Contenedor (Dashboard) re-fetcha `/api/metrics/alerts?threshold=0.1&...`.
- Tabla se actualiza con nuevas alertas (más filas).
- **UI esperada**: Spinner/skeleton breve, luego tabla actualizada.

---

## Funcionalidad 3: Vista Comparativa B2B vs B2C

### Descripción

Nueva página en el dashboard que compara el rendimiento de ingresos entre B2B y B2C. Contiene dos paneles lado a lado (cada uno con una tabla de categorías de ingreso; en los datos actuales la API devuelve 2 filas por línea) y un gráfico que compara el total de ingresos por período entre ambas líneas de negocio. El usuario puede filtrar por rango de fechas.

### Endpoints

**Obtener categorías top-5 para una línea de negocio:**

```
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

**Parámetros**:

- `operation_type` (string, opcional, default: `outcome`): Tipo de operación. Valores: `income`, `outcome`. **Para esta funcionalidad, siempre usar `income`**.
- `limit` (integer, opcional, default: 5): Número máximo de categorías a devolver. Rango: 1-20.
- `business_type` (string, opcional): Línea de negocio. Valores: `B2B`, `B2C`. **Requerido para esta funcionalidad**.
- `start_date` (string, opcional): Fecha de inicio (YYYY-MM-DD).
- `end_date` (string, opcional): Fecha de fin (YYYY-MM-DD).

**Respuesta** (tipo: `TopCategoriesResponse`):

```json
[
  {
    "category": "sales",
    "operation_type": "income",
    "total_amount": 557903.97
  },
  {
    "category": "others",
    "operation_type": "income",
    "total_amount": 57636.75
  }
]
```

**Nota**: Puede devolver menos de 5 filas si existen menos de 5 categorías con ingresos para esa línea de negocio. En los datos actuales de ingresos, la API devuelve 2 filas por línea.

**Obtener datos agregados para gráfico comparativo:**

```
GET /api/metrics/summary?business_type=B2B&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
GET /api/metrics/summary?business_type=B2C&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
```

**Parámetros**:

- `business_type` (string, opcional): Línea de negocio (`B2B` o `B2C`).
- `start_date`, `end_date` (strings, opcionales): Rango de fechas.
- `group_by` (string, opcional, default: `month`): Granularidad temporal.

**Respuesta** (tipo: `SummaryResponse`):

```json
[
  {
    "period": "2025-11",
    "income": 54757.96,
    "outcome": 26785.3,
    "net": 27972.66
  },
  {
    "period": "2025-12",
    "income": 47166.41,
    "outcome": 72778.68,
    "net": -25612.27
  }
]
```

**Ruta de Facetas** (para referencias de categorías disponibles):

```
GET /api/metrics/facets
```

Devuelve `categories` array con todas las categorías disponibles. Es global (no separa B2B/B2C); las categorías de cada panel salen de `/api/metrics/categories/top?business_type=`.

### Tipos TypeScript

**Interfaz de parámetros (categorías top):**

```typescript
interface TopCategoriesParams extends DateRangeFilter {
  operation_type?: 'income' | 'outcome';  // default: 'outcome', use 'income'
  limit?: number;                          // default: 5, range: 1-20
  business_type?: 'B2B' | 'B2C';
}
```

**Interfaz de entrada (un CategoryEntry):**

```typescript
interface CategoryEntry {
  category: Category;  // ver api-types.ts
  operation_type: 'income' | 'outcome';
  total_amount: number;
}
```

**Interfaz de respuesta (categorías):**

```typescript
type TopCategoriesResponse = CategoryEntry[];
```

**Interfaz de entrada (un SummaryDataPoint):**

```typescript
interface SummaryDataPoint {
  period: string;        // YYYY-MM by default
  income: number;
  outcome: number;
  net: number;
}
```

**Interfaz de respuesta (resumen):**

```typescript
type SummaryResponse = SummaryDataPoint[];
```

### Componentes UI

**Nombre**: `ComparisonPage` (Contenedor principal)

**Props**:

```typescript
interface ComparisonPageProps {
  b2bCategories: CategoryEntry[];
  b2cCategories: CategoryEntry[];
  chartData: Array<{ period: string; b2b: number; b2c: number }>;
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDateAvailable: string;
  maxDateAvailable: string;
  b2bGroupTotal: number;   // suma de income B2B en el rango activo (denominador de %)
  b2cGroupTotal: number;   // suma de income B2C en el rango activo (denominador de %)
  loading?: boolean;
  error?: string;
}
```

**Nombre**: `TopCategoriesPanel`

**Props**:

```typescript
interface TopCategoriesPanelProps {
  businessType: 'B2B' | 'B2C';
  categories: CategoryEntry[];
  groupTotal: number;   // total de ingresos del grupo en el rango activo
  loading?: boolean;
}
```

**Tabla con 3 columnas**:

| Encabezado | Fuente | Formato | Notas |
|-----------|--------|---------|-------|
| Categoría | `CategoryEntry.category` | Texto | Nombre de la categoría |
| Total de Ingresos | `CategoryEntry.total_amount` | Número con separador de miles, 2 decimales | 557,903.97 |
| % del Total del Grupo | Calculado | Porcentaje | Fórmula: `(total_amount / groupTotal) * 100`, con 1 decimal. Ejemplo: total_amount=600000 y groupTotal=1000000 → "60.0%". Si groupTotal es 0 → "0.0%". |

**Nombre**: `ComparisonChart`

**Props**:

```typescript
interface ComparisonChartProps {
  data: Array<{ period: string; b2b: number; b2c: number }>;
  loading?: boolean;
}
```

**Gráfico**:

- Tipo: Líneas o barras agrupadas.
- Eje X: Períodos (ej: "2025-11", "2025-12", ...).
- Eje Y: Monto en unidades de moneda.
- Serie 1 (B2B): Color azul/primario.
- Serie 2 (B2C): Color verde/secundario.
- Título: "Comparación de Ingresos Totales: B2B vs B2C".
- Tooltip: Mostrar período, monto B2B, monto B2C.

### Restricciones de Parámetros

| Parámetro | Tipo | Restricción | Comportamiento |
|-----------|------|-------------|-----------------|
| `operation_type` | string | Usar "income" | Hardcodeado a "income" en solicitudes a `/categories/top`. |
| `limit` | integer | 1-20 | Valor por defecto: 5. API rechaza valores fuera de rango con error 422. |
| `business_type` | string | "B2B" o "B2C" | Requerido para cada panel y solicitud de resumen. |
| `start_date` | string | Formato YYYY-MM-DD | Reutiliza validación de Funcionalidad 1. |
| `end_date` | string | Formato YYYY-MM-DD | Reutiliza validación de Funcionalidad 1. |

### Casos Límite

**Caso 1: Panel vacío (sin categorías de ingreso)**
- Usuario ve página B2B, pero ese período no tiene ingresos registrados.
- API devuelve array vacío para `GET /api/metrics/categories/top?operation_type=income&business_type=B2B`.
- **UI esperada**: Panel B2B renderiza mensaje:
  ```
  "No hay categorías de ingreso disponibles para B2B en este período."
  ```
  Tabla no se renderiza.

**Caso 2: Ambos paneles vacíos**
- Usuario establece filtro de fechas muy restrictivo.
- Ambas solicitudes devuelven arrays vacíos.
- **UI esperada**: Ambos paneles muestran mensajes de estado vacío. Gráfico puede estar vacío o mostrar "Sin datos".

**Caso 3: Solo una línea de negocio tiene datos**
- Período contiene ingresos solo de B2B, no de B2C.
- Panel B2B renderiza su tabla de categorías (2 filas en los datos actuales); panel B2C renderiza estado vacío.
- Gráfico muestra barras/línea solo para B2B, cero para B2C en ese período.
- **UI esperada**: Asimétrico pero correcto, sin errores.

**Caso 4: Límite de 1 categoría**
- Usuario configura una solicitud con `limit=1` (la UI no lo usa; fija 5).
- API devuelve solo la categoría con mayor ingreso de cada línea.
- **UI esperada**: Tabla con 1 fila. El porcentaje se calcula sobre el total del grupo, no sobre las filas mostradas, por lo que no es 100%.

**Caso 5: Sin datos en gráfico (rango de fechas vacío)**
- Usuario establece `start_date = "2026-11-01"` (futuro, fuera del dataset).
- Ambas llamadas a `/summary` devuelven arrays vacíos.
- **UI esperada**: Gráfico no renderiza series, muestra "No hay datos disponibles para este período."

**Caso 6: Cambio de filtro de fechas**
- Usuario modifica `start_date` o `end_date`.
- Contenedor re-fetcha todas las solicitudes (top-5 B2B, top-5 B2C, summary B2B, summary B2C).
- Tablas y gráfico se actualizan.
- **UI esperada**: Spinner/skeleton breve en paneles afectados, luego contenido actualizado.

---

## Resumen de Endpoints y Flujo

### Endpoints por Funcionalidad

| Funcionalidad | Endpoint | Método | Parámetros Clave |
|---------------|----------|--------|------------------|
| 1. Rango de fechas | `/api/metrics/facets` | GET | Ninguno |
| 1. Métricas filtradas | `/api/metrics` | GET | start_date, end_date |
| 2. Alertas | `/api/metrics/alerts` | GET | threshold, start_date, end_date, business_type |
| 3. Top categorías | `/api/metrics/categories/top` | GET | operation_type=income, limit=5, business_type, start_date, end_date |
| 3. Datos agregados | `/api/metrics/summary` | GET | business_type, start_date, end_date |

### Flujo de Carga Inicial (Dashboard con todas las funcionalidades)

1. **Componente monta** → Obtener `/api/metrics/facets` → Renderizar `DateRangeFilter` con rango disponible.
2. **Usuario establece filtro de fechas** o **por defecto (sin filtro)** → Re-fetchar `/api/metrics` con `start_date`, `end_date` opcionales.
3. **Tablas y gráficos existentes se actualizan** → Los datos filtrados se usan en componentes existentes.
4. **Renderizar `AnomalyAlertsTable`** → Fetchar `/api/metrics/alerts` con threshold default (0.3) y filtros de fecha.
5. **Usuario ajusta threshold** → Re-fetchar `/api/metrics/alerts` con nuevo threshold.
6. **Navegar a "Comparación B2B vs B2C"** → Fetchar 4 endpoints en paralelo:
   - `/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B&...`
   - `/api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C&...`
   - `/api/metrics/summary?business_type=B2B&...`
   - `/api/metrics/summary?business_type=B2C&...`
7. **Renderizar tablas y gráfico** → Mostrar datos comparativos.

---

## Validación de Tipos

Todos los tipos de los specs se validan con `npx tsc --noEmit --ignoreConfig --strict --target es2020 --moduleResolution bundler --module esnext specs/api-types.ts specs/param-types.ts` (desde `frontend/`). `tsconfig.app.json` debe seguir compilando. No se usa `any` ni `object` genérico; todas las propiedades están completamente tipadas.

**Archivos de tipo**:

- [`api-types.ts`](./api-types.ts) — Respuestas de API (`FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `TopCategoriesResponse`, `SummaryDataPoint`, `SummaryResponse`).
- [`param-types.ts`](./param-types.ts) — Parámetros de query (`DateRangeFilter`, `AlertsParams`, `TopCategoriesParams`, `SummaryParams`, `MetricsParams`).

---

## Notas Finales

- Todas las fechas se intercambian en formato YYYY-MM-DD (ISO 8601 sin hora).
- El API puede devolver menos resultados que el `limit` solicitado (p. ej., top-5 con solo 2 categorías).
- Estados vacíos siempre muestran un mensaje explícito, nunca una tabla vacía.
- Los filtros de fecha son opcionales en cliente; cuando ambos están vacíos, la API devuelve todo el dataset.
- La API acepta `threshold` >= 0 sin máximo; la UI limita el rango a 0.01–1.0.
