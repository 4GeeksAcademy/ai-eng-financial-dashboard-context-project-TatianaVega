import type { AlertEntry } from "@/lib/api-types";

interface AnomalyAlertsTableProps {
  alerts: AlertEntry[];
  threshold: number;
  onThresholdChange: (newThreshold: number) => void;
  loading?: boolean;
  error?: string;
}

export function AnomalyAlertsTable({
  alerts,
  threshold,
  onThresholdChange,
  loading = false,
  error,
}: AnomalyAlertsTableProps) {
  const handleThresholdChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onThresholdChange(num);
    }
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-ES", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (ratio: number): string => {
    const percentage = (ratio - 1) * 100;
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="threshold-input" className="block text-sm font-medium">
            Threshold de alerta
          </label>
          <input
            id="threshold-input"
            type="number"
            value={threshold}
            onChange={(e) => handleThresholdChange(e.target.value)}
            min="0"
            step="0.01"
            disabled={loading}
            className="mt-1 w-full max-w-xs rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Rango recomendado: 0.01 a 1.0
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          No se detectaron anomalías para el threshold actual. Intenta reducir
          el valor de threshold para detectar cambios más pequeños.
        </div>
      )}

      {!loading && !error && alerts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-gray-700">
              <tr className="text-left">
                <th className="pb-3 font-medium">Período</th>
                <th className="pb-3 font-medium">Outcome Registrado</th>
                <th className="pb-3 font-medium">Media Móvil (3 períodos)</th>
                <th className="pb-3 font-medium">Incremento Porcentual</th>
              </tr>
            </thead>
            <tbody>
              {[...alerts]
                .sort((a, b) => b.period.localeCompare(a.period))
                .map((alert) => (
                  <tr
                    key={alert.period}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="py-3">{alert.period}</td>
                    <td className="py-3">${formatCurrency(alert.outcome_total)}</td>
                    <td className="py-3">${formatCurrency(alert.baseline_average)}</td>
                    <td className="py-3">{formatPercentage(alert.increase_ratio)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
