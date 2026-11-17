import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { DateRangeFilter } from "@/components/features/DateRangeFilter";
import { AnomalyAlertsTable } from "@/components/features/AnomalyAlertsTable";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import type { AlertEntry, FacetsResponse } from "@/lib/api-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  const [alerts, setAlerts] = useState<AlertEntry[]>([]);
  const [threshold, setThreshold] = useState(0.3);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const fetchFacets = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/metrics/facets`);
        if (!response.ok) throw new Error("Failed to fetch facets");
        const data: FacetsResponse = await response.json();
        setMinDate(data.min_date);
        setMaxDate(data.max_date);
      } catch (err) {
        setError("No se pudo cargar el rango de fechas disponibles");
      }
    };
    fetchFacets();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      setAlertsLoading(true);
      setAlertsError(null);
      try {
        const params = new URLSearchParams();
        params.append("threshold", threshold.toString());
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);

        const response = await fetch(
          `${API_BASE_URL}/api/metrics/alerts?${params}`
        );
        if (!response.ok) throw new Error("Failed to fetch alerts");
        const data: AlertEntry[] = await response.json();
        setAlerts(data);
      } catch (err) {
        setAlertsError(
          err instanceof Error ? err.message : "Error loading alerts"
        );
      } finally {
        setAlertsLoading(false);
      }
    };

    fetchAlerts();
  }, [threshold, startDate, endDate]);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : null}

          {minDate && maxDate && (
            <DateRangeFilter
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              minDateAvailable={minDate}
              maxDateAvailable={maxDate}
              loading={loading}
            />
          )}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>

          <section aria-label="Anomaly alerts">
            <AnomalyAlertsTable
              alerts={alerts}
              threshold={threshold}
              onThresholdChange={setThreshold}
              loading={alertsLoading}
              error={alertsError || undefined}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
