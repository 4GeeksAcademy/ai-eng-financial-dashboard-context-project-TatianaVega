import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DateRangeFilter } from "@/components/features/DateRangeFilter";
import { TopCategoriesPanel } from "@/components/features/TopCategoriesPanel";
import { ComparisonChart } from "@/components/features/ComparisonChart";
import type {
  CategoryEntry,
  FacetsResponse,
  SummaryDataPoint,
} from "@/lib/api-types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export function ComparisonPage() {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [minDate, setMinDate] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>("");

  const [b2bCategories, setB2bCategories] = useState<CategoryEntry[]>([]);
  const [b2cCategories, setB2cCategories] = useState<CategoryEntry[]>([]);
  const [chartData, setChartData] = useState<
    Array<{ period: string; b2b: number; b2c: number }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch facets on mount
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

  // Fetch comparison data when filters change
  useEffect(() => {
    if (!minDate || !maxDate) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (startDate) params.append("start_date", startDate);
        if (endDate) params.append("end_date", endDate);

        // Fetch top categories for B2B
        const b2bTopParams = new URLSearchParams(params);
        b2bTopParams.append("business_type", "B2B");
        b2bTopParams.append("operation_type", "income");
        b2bTopParams.append("limit", "5");
        const b2bTopRes = await fetch(
          `${API_BASE_URL}/api/metrics/categories/top?${b2bTopParams}`
        );
        if (!b2bTopRes.ok) throw new Error("Failed to fetch B2B categories");
        const b2bTop: CategoryEntry[] = await b2bTopRes.json();
        setB2bCategories(b2bTop);

        // Fetch top categories for B2C
        const b2cTopParams = new URLSearchParams(params);
        b2cTopParams.append("business_type", "B2C");
        b2cTopParams.append("operation_type", "income");
        b2cTopParams.append("limit", "5");
        const b2cTopRes = await fetch(
          `${API_BASE_URL}/api/metrics/categories/top?${b2cTopParams}`
        );
        if (!b2cTopRes.ok) throw new Error("Failed to fetch B2C categories");
        const b2cTop: CategoryEntry[] = await b2cTopRes.json();
        setB2cCategories(b2cTop);

        // Fetch summary data for B2B
        const b2bSummaryParams = new URLSearchParams(params);
        b2bSummaryParams.append("business_type", "B2B");
        const b2bSummaryRes = await fetch(
          `${API_BASE_URL}/api/metrics/summary?${b2bSummaryParams}`
        );
        if (!b2bSummaryRes.ok) throw new Error("Failed to fetch B2B summary");
        const b2bSummary: SummaryDataPoint[] = await b2bSummaryRes.json();

        // Fetch summary data for B2C
        const b2cSummaryParams = new URLSearchParams(params);
        b2cSummaryParams.append("business_type", "B2C");
        const b2cSummaryRes = await fetch(
          `${API_BASE_URL}/api/metrics/summary?${b2cSummaryParams}`
        );
        if (!b2cSummaryRes.ok) throw new Error("Failed to fetch B2C summary");
        const b2cSummary: SummaryDataPoint[] = await b2cSummaryRes.json();

        // Merge summary data into chart format
        const merged = b2bSummary.map((b2bPoint) => {
          const b2cPoint = b2cSummary.find((p) => p.period === b2bPoint.period);
          return {
            period: b2bPoint.period,
            b2b: b2bPoint.income,
            b2c: b2cPoint?.income || 0,
          };
        });

        setChartData(merged);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error loading comparison data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, minDate, maxDate]);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="Comparativa B2B vs B2C" />

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

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

          <div className="grid gap-6 lg:grid-cols-2">
            <TopCategoriesPanel
              businessType="B2B"
              categories={b2bCategories}
              loading={loading}
            />
            <TopCategoriesPanel
              businessType="B2C"
              categories={b2cCategories}
              loading={loading}
            />
          </div>

          <ComparisonChart data={chartData} loading={loading} />
        </div>
      </div>
    </main>
  );
}
