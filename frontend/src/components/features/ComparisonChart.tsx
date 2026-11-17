interface ComparisonChartProps {
  data: Array<{ period: string; b2b: number; b2c: number }>;
  loading?: boolean;
}

export function ComparisonChart({ data, loading = false }: ComparisonChartProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-ES", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold">
          Comparación de Ingresos Totales: B2B vs B2C
        </h3>
        <div className="h-64 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold">
          Comparación de Ingresos Totales: B2B vs B2C
        </h3>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          No hay datos disponibles para este período.
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...data.flatMap((d) => [d.b2b, d.b2c])
  );
  const scale = maxValue > 0 ? 100 / maxValue : 100;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-6 font-semibold">
        Comparación de Ingresos Totales: B2B vs B2C
      </h3>
      
      <div className="mb-4 flex gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500" />
          <span className="text-sm">B2B</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm">B2C</span>
        </div>
      </div>

      <div className="space-y-6 overflow-x-auto">
        {data.map((point) => (
          <div key={point.period}>
            <div className="mb-2 text-sm font-medium">{point.period}</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs">${formatCurrency(point.b2b)}</div>
                <div className="h-6 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-blue-500 transition-all"
                    style={{ width: `${point.b2b * scale}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 text-xs">${formatCurrency(point.b2c)}</div>
                <div className="h-6 flex-1 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${point.b2c * scale}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
