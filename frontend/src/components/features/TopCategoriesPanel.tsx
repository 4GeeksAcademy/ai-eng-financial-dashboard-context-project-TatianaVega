import type { CategoryEntry } from "@/lib/api-types";

interface TopCategoriesPanelProps {
  businessType: "B2B" | "B2C";
  categories: CategoryEntry[];
  loading?: boolean;
}

export function TopCategoriesPanel({
  businessType,
  categories,
  loading = false,
}: TopCategoriesPanelProps) {
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-ES", {
      style: "decimal",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const totalAmount = categories.reduce((sum, cat) => sum + cat.total_amount, 0);

  const getPercentage = (amount: number): string => {
    if (totalAmount === 0) return "0.0%";
    return ((amount / totalAmount) * 100).toFixed(1) + "%";
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold">Top 5 Categorías - {businessType}</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 rounded bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
        <h3 className="mb-4 font-semibold">Top 5 Categorías - {businessType}</h3>
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
          No hay categorías de ingreso disponibles para {businessType} en este período.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 font-semibold">Top 5 Categorías - {businessType}</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 dark:border-gray-700">
            <tr className="text-left">
              <th className="pb-3 font-medium">Categoría</th>
              <th className="pb-3 font-medium text-right">Total de Ingresos</th>
              <th className="pb-3 font-medium text-right">% del Total</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr
                key={category.category}
                className="border-b border-gray-200 dark:border-gray-700"
              >
                <td className="py-3">{category.category}</td>
                <td className="py-3 text-right">
                  ${formatCurrency(category.total_amount)}
                </td>
                <td className="py-3 text-right">
                  {getPercentage(category.total_amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
