import { useEffect, useState } from "react";

interface DateRangeFilterProps {
  startDate?: string;
  endDate?: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  minDateAvailable: string;
  maxDateAvailable: string;
  loading?: boolean;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDateAvailable,
  maxDateAvailable,
  loading = false,
}: DateRangeFilterProps) {
  const [hasDates, setHasDates] = useState(false);

  useEffect(() => {
    setHasDates(Boolean(minDateAvailable && maxDateAvailable));
  }, [minDateAvailable, maxDateAvailable]);

  if (!hasDates) {
    return (
      <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
        No se pudo cargar el rango de fechas disponibles. Intenta más tarde.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <label htmlFor="start-date" className="block text-sm font-medium">
            Fecha de inicio
          </label>
          <input
            id="start-date"
            type="date"
            value={startDate || ""}
            onChange={(e) => onStartDateChange(e.target.value)}
            min={minDateAvailable}
            max={maxDateAvailable}
            disabled={loading}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="end-date" className="block text-sm font-medium">
            Fecha de fin
          </label>
          <input
            id="end-date"
            type="date"
            value={endDate || ""}
            onChange={(e) => onEndDateChange(e.target.value)}
            min={minDateAvailable}
            max={maxDateAvailable}
            disabled={loading}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">
        Rango disponible: {minDateAvailable} a {maxDateAvailable}
      </p>
    </div>
  );
}
