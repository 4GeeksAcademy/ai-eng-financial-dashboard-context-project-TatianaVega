# Especificación de Componentes

Este documento especifica la estructura, props y comportamiento de los componentes React necesarios para implementar las tres funcionalidades nuevas del dashboard financiero.

---

## Funcionalidad 1: Filtro de Rango de Fechas en Dashboard Principal

### Componentes

#### `DateRangeFilter`

**Propósito**: Renderizar dos inputs de fecha (inicio y fin) y una pista informativa que muestre el rango de fechas disponibles en el dataset.

**Props**:

```typescript
interface DateRangeFilterProps {
  /**
   * Valor de fecha de inicio (YYYY-MM-DD).
   * Undefined o string vacío indica que no hay filtro de inicio.
   */
  startDate?: string;

  /**
   * Valor de fecha de fin (YYYY-MM-DD).
   * Undefined o string vacío indica que no hay filtro de fin.
   */
  endDate?: string;

  /**
   * Callback ejecutado cuando el usuario cambia el input de fecha de inicio.
   * Recibe el valor de la fecha como string (formato YYYY-MM-DD) o string vacío.
   */
  onStartDateChange: (date: string) => void;

  /**
   * Callback ejecutado cuando el usuario cambia el input de fecha de fin.
   * Recibe el valor de la fecha como string (formato YYYY-MM-DD) o string vacío.
   */
  onEndDateChange: (date: string) => void;

  /**
   * Fecha mínima disponible en el dataset (YYYY-MM-DD).
   * Obtenida de FacetsResponse.min_date. Undefined mientras carga facets o si falló.
   */
  minDateAvailable?: string;

  /**
   * Fecha máxima disponible en el dataset (YYYY-MM-DD).
   * Obtenida de FacetsResponse.max_date. Undefined mientras carga facets o si falló.
   */
  maxDateAvailable?: string;

  /**
   * Mensaje de error si GET /api/metrics/facets falla. Si está definido, los inputs se deshabilitan.
   */
  facetsError?: string;

  /**
   * Estado de carga. Si true, los inputs se desactivan y se muestra un indicador.
   */
  loading?: boolean;
}
```

**Comportamiento**:

- **Layout**: Dos inputs de tipo `date` lado a lado o en fila única. Labels: "Fecha de inicio" y "Fecha de fin".
- **Pista de rango**: Texto informativo debajo de los inputs mostrando: `"Rango disponible: ${minDateAvailable} a ${maxDateAvailable}"`.
- **Solo inicio relleno**: el contenedor envía solo `start_date`; la API no aplica límite superior (datos desde inicio hasta el último dato disponible). El componente no modifica `endDate`.
- **Solo fin relleno**: el contenedor envía solo `end_date`; la API no aplica límite inferior (datos desde el primer dato disponible hasta fin).
- **Ambos vacíos**: Se muestra el mensaje de rango disponible; no se aplica filtro.
- **Inicio posterior a fin** (ambos rellenos y `startDate > endDate`): mostrar `"La fecha de inicio debe ser anterior o igual a la fecha de fin."` y no enviar la petición con ese rango.
- **Estados de entrada**:
  - Input `type="date"` con validación HTML5.
  - `min` atributo = `minDateAvailable`.
  - `max` atributo = `maxDateAvailable`.
  - Deshabilitado cuando `loading === true`.
- **Comportamiento en caso de error**: Si `facetsError` está definido, mostrar `"No se pudo cargar el rango de fechas disponibles. Intenta más tarde."` y deshabilitar ambos inputs..

**Renderizado condicional**:

```
Si loading === true:
  Inputs deshabilitados + spinner o skeleton
  
Si minDateAvailable y maxDateAvailable están definidos:
  Render inputs normales + pista de rango
  
Si facetsError está definido:
  Mostrar mensaje de error; inputs deshabilitados
```

---

## Funcionalidad 2: Tabla de Alertas de Anomalías

### Componentes

#### `AnomalyAlertsTable`

**Propósito**: Renderizar una tabla con alertas de anomalías (períodos donde el gasto subió inesperadamente), con un control de threshold configurable.

**Props**:

```typescript
interface AnomalyAlertsTableProps {
  /**
   * Lista de alertas obtenidas de GET /api/metrics/alerts
   */
  alerts: AlertEntry[];

  /**
   * Valor actual del threshold (ratio). Rango válido en UI: 0.01 a 1.0.
   * Default: 0.3
   */
  threshold: number;

  /**
   * Callback cuando el usuario cambia el input de threshold.
   * Recibe el nuevo valor como número.
   */
  onThresholdChange: (newThreshold: number) => void;

  /**
   * Estado de carga; cuando true, se muestra spinner/skeleton en lugar de tabla.
   */
  loading?: boolean;

  /**
   * Mensaje de error (si la llamada a /api/metrics/alerts falla).
   * Si está presente, se muestra en lugar de la tabla.
   */
  error?: string;
}
```

**Columnas de la tabla**:

| Columna | Tipo de dato | Fuente en API | Descripción |
|---------|--------------|---------------|-------------|
| **Período** | `string` | `AlertEntry.period` | Identificador del período (p. ej., `2025-12` para diciembre 2025) |
| **Outcome Registrado** | `number` | `AlertEntry.outcome_total` | Total de gasto para este período (formato: número con separador de miles y 2 decimales) |
| **Media histórica** | `number` | `AlertEntry.baseline_average` | Media acumulada de `outcome_total` de todos los períodos anteriores (formato: número con separador de miles y 2 decimales). El PM pidió media móvil de 3 períodos; la API no la calcula. Ver Desajustes PM vs API. |
| **Incremento Porcentual** | `string` | `AlertEntry.increase_ratio` | Porcentaje calculado como `increase_ratio * 100`, con signo `+`, 2 decimales y sufijo `%`. Ejemplo: `1.4968` → `+149.68%`; `0.3632` → `+36.32%`. Siempre positivo, porque la API solo devuelve períodos por encima del threshold. |

**Comportamiento**:

- **Input de Threshold**:
  - Tipo: `number` input.
  - Label: `"Threshold de alerta"`.
  - Valor mínimo: `0.01`. Valor máximo: `1.0`. Paso: `0.01`.
  - Default: `0.3`.
  - Cuando el usuario cambia el valor, ejecutar `onThresholdChange(newValue)` y la tabla debe actualizarse con nuevas alertas (contenedor re-fetcha datos).

- **Tabla**:
  - Componente: tabla HTML estándar o componente de tabla (p. ej., DataTable de shadcn/ui si ya existe en el proyecto).
  - Ordenamiento: por defecto, ordenar por `period` descendente (más reciente primero).
  - Filas: cada fila representa un `AlertEntry`.

- **Estado vacío**:
  - Si `alerts.length === 0` y `!error` y `!loading`, mostrar un mensaje explícito:
    ```
    "No se detectaron anomalías para el threshold actual.
    Intenta reducir el valor de threshold para detectar cambios más pequeños."
    ```
  - Este mensaje debe reemplazar la tabla por completo (no mostrar tabla vacía).

- **Estado de carga**:
  - Si `loading === true`, mostrar skeleton/spinner en lugar de tabla.
  - Duración esperada: breve (típicamente < 1s).

- **Estado de error**:
  - Si `error` está definido, mostrar mensaje de error debajo del input de threshold:
    ```
    <div className="text-red-500">
      {error}
    </div>
    ```
  - No renderizar tabla cuando hay error.

**Validación de threshold**:

- Valores fuera de [0.01, 1.0], vacíos o no numéricos: mostrar `"El threshold debe estar entre 0.01 y 1.0."`, no ejecutar `onThresholdChange` y mantener la última tabla válida.
- Valores válidos: ejecutar `onThresholdChange` inmediatamente.
- La API acepta cualquier valor >= 0 (HTTP 422 si es negativo); el límite superior 1.0 es regla de la UI, no de la API.

**Integración con Funcionalidad 1 (Filtro de fechas)**:

- El componente NO renderiza inputs de fecha; eso es responsabilidad de `DateRangeFilter`.
- El contenedor (Dashboard) debe pasar `start_date` y `end_date` como parte de la solicitud a `/api/metrics/alerts` cuando se re-fetcha.
- Si el filtro de fechas cambia, el contenedor re-fetcha alertas y actualiza `alerts` prop.

---

## Funcionalidad 3: Vista Comparativa B2B vs B2C

### Componentes

#### `ComparisonPage` (Contenedor)

**Propósito**: Layout principal de dos paneles (B2B y B2C) con tabla de categorías top-5 y gráfico comparativo de totales.

**Props**:

```typescript
interface ComparisonPageProps {
  /**
   * Tabla de categorías top-5 para B2B.
   * Fuente: GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2B (con start_date/end_date si están definidos). Máximo 2 filas en la API.
   */
  b2bCategories: CategoryEntry[];

  /**
   * Tabla de categorías top-5 para B2C.
   * Fuente: GET /api/metrics/categories/top?operation_type=income&limit=5&business_type=B2C (con start_date/end_date si están definidos). Máximo 2 filas en la API.
   */
  b2cCategories: CategoryEntry[];

  /**
   * Puntos del gráfico: total de ingresos B2B y B2C por período.
   * Combina GET /api/metrics/summary?business_type=B2B&group_by=month y ...business_type=B2C..., usando `SummaryDataPoint.income` y uniendo por `period`.
   * Incluye start_date/end_date si están definidos.
   */
  chartData: Array<{ period: string; b2b: number; b2c: number }>;

  /**
   * Fecha de inicio de rango (YYYY-MM-DD).
   * Undefined significa sin filtro de inicio.
   */
  startDate?: string;

  /**
   * Fecha de fin de rango (YYYY-MM-DD).
   * Undefined significa sin filtro de fin.
   */
  endDate?: string;

  /**
   * Callback cuando el usuario cambia el filtro de fecha de inicio.
   */
  onStartDateChange: (date: string) => void;

  /**
   * Callback cuando el usuario cambia el filtro de fecha de fin.
   */
  onEndDateChange: (date: string) => void;

  /**
   * Fecha mínima disponible en el dataset.
   */
  minDateAvailable: string;

  /**
   * Fecha máxima disponible en el dataset.
   */
  maxDateAvailable: string;

  /**
   * Total de ingresos del grupo B2B en el rango activo (denominador de %). Fuente: GET /api/metrics/summary?business_type=B2B, suma de `income`.
   */
  b2bGroupTotal: number;

  /**
   * Total de ingresos del grupo B2C en el rango activo (denominador de %). Fuente: GET /api/metrics/summary?business_type=B2C, suma de `income`.
   */
  b2cGroupTotal: number;

  /**
   * Estado de carga general.
   */
  loading?: boolean;

  /**
   * Mensaje de error (si falla la carga de datos).
   */
  error?: string;
}
```

**Layout**:

```
<ComparisonPage>
  <DateRangeFilter /> (Reutilizado de Funcionalidad 1)
  
  <div className="grid grid-cols-2 gap-6">
    <TopCategoriesPanel businessType="B2B" categories={b2bCategories} groupTotal={b2bGroupTotal} loading={loading} />
    
    <TopCategoriesPanel businessType="B2C" categories={b2cCategories} groupTotal={b2cGroupTotal} loading={loading} />
  </div>
  
  <ComparisonChart data={chartData} />
</ComparisonPage>
```

#### `TopCategoriesPanel`

**Propósito**: Renderizar una tabla top-5 de categorías para una línea de negocio (B2B o B2C).

**Props**:

```typescript
interface TopCategoriesPanelProps {
  /**
   * Nombre de la línea de negocio: "B2B" o "B2C"
   */
  businessType: 'B2B' | 'B2C';

  /**
   * Array de categorías ordenadas por total_amount descendente.
   */
  categories: CategoryEntry[];

  /**
   * Total de ingresos del grupo en el rango activo. Denominador de `% del Total del Grupo`.
   */
  groupTotal: number;

  /**
   * Estado de carga.
   */
  loading?: boolean;
}
```

**Columnas de la tabla**:

| Columna | Tipo de dato | Fuente en API | Descripción |
|---------|--------------|---------------|-------------|
| **Categoría** | `string` | `CategoryEntry.category` | Nombre de la categoría (p. ej., `sales`, `suppliers`) |
| **Total de Ingresos** | `number` | `CategoryEntry.total_amount` | Monto total (formato: número con separador de miles y 2 decimales) |
| **% del Total del Grupo** | `string` | Calculado en frontend | `(total_amount / groupTotal) * 100`. Formato: `XX.X%`. `groupTotal` es el total de ingresos del grupo, no la suma del top. |

**Comportamiento**:

- **Tabla**:
  - Ordenada por `total_amount` descendente (ya ordenada por API, pero mantener en componente).
  - Máximo 5 filas. Para ingresos la API devuelve como máximo 2 (`sales` y `others`).
  
- **Estado vacío (array vacío)**:
  - Renderizar mensaje:
    ```
    "No hay categorías de ingreso disponibles para {businessType} en este período."
    ```
  - No renderizar tabla.

- **Estado de carga**:
  - Si `loading === true`, mostrar skeleton/spinner.

- **Cálculo de porcentaje**:
  - Denominador: `groupTotal`.
  - Para cada fila: `(total_amount / groupTotal) * 100`, redondeado a 1 decimal.
  - Si `groupTotal` es 0, mostrar `0.0%`.

#### `ComparisonChart`

**Propósito**: Gráfico que compara el total de ingresos B2B vs B2C por período.

**Props**:

```typescript
interface ComparisonChartProps {
  /**
   * Array de puntos de datos para el gráfico.
   * Cada punto tiene: period, b2b (monto), b2c (monto).
   * Obtenidos de GET /api/metrics/summary filtrado por business_type.
   */
  data: Array<{ period: string; b2b: number; b2c: number }>;

  /**
   * Estado de carga.
   */
  loading?: boolean;
}
```

**Comportamiento**:

- **Tipo de gráfico**: barras agrupadas (una barra B2B y una B2C por período).
- **Valores**: `b2b` = total de ingresos B2B del período; `b2c` = total de ingresos B2C del período. Ambos en unidades de moneda.
- **Ejes**:
  - X: períodos (p. ej., meses `2025-11`, `2025-12`, etc.).
  - Y: monto en unidades de moneda.
- **Series**:
  - Serie 1 (B2B): color azul/primario.
  - Serie 2 (B2C): color verde/secundario.
- **Etiqueta**: Título del gráfico: `"Comparación de Ingresos Totales: B2B vs B2C"`.
- **Tooltip**: Mostrar monto exacto y línea de negocio al pasar el mouse.
- **Sin datos** (`data` vacío): mostrar `"No hay datos disponibles para este período."` en lugar del gráfico.

---

## Notas de Integración Transversal

### Comportamiento cuando un solo input de fecha está relleno

- **Si solo `startDate` está relleno**:
  - Enviado a API como `start_date=${startDate}`, sin `end_date`.
  - API devuelve datos desde esa fecha hasta la máxima disponible.
  - Componentes deben renderizarse normalmente con el dataset filtrado.

- **Si solo `endDate` está relleno**:
  - Enviado a API como `end_date=${endDate}`, sin `start_date`.
  - API devuelve datos desde la mínima disponible hasta esa fecha.
  - Componentes deben renderizarse normalmente.

### Estado vacío: líneas directrices generales

- **Tabla vacía** → Mensaje explícito, no ocultar componente.
- **Gráfico sin datos** → Mostrar "No hay datos disponibles para este período" o similar.
- **Error de API** → Mostrar `error` prop en el componente, con reintentos disponibles si es apropiado.

### Responsabilidad del contenedor (Dashboard/Página padre)

- Manejar estado de `startDate`, `endDate`, `threshold`.
- Re-fetchar datos cuando cambien estos filtros.
- Pasar props actualizadas a componentes hijo.
- Manejar errores de API y estado de carga.

---

## Desajustes PM vs API

- **Media móvil de 3 períodos**: la API devuelve la media acumulada de todos los períodos previos (`baseline_average`). La UI la etiqueta "Media histórica". Una media móvil real requiere cambiar el backend (fuera de esta spec).
- **Top 5 de ingresos**: la API solo tiene categorías `sales` y `others` para ingresos; cada panel muestra como máximo 2 filas.
- **Categorías por grupo**: `FacetsResponse.categories` es global y no separa por B2B/B2C. Las categorías de cada panel vienen de `/api/metrics/categories/top?business_type=`.
