/**
 * API Response Types for Dashboard Financial Specifications
 * All types are verified against OpenAPI schema (http://localhost:8000/openapi.json)
 * and tested against live API responses.
 */

/** Allowed category values, as defined by the OpenAPI enum for `category`. */
export type Category = 'suppliers' | 'sales' | 'operational' | 'administrative' | 'others';

/**
 * Facets response (OpenAPI schema: MetricsFacets) with available values and date range for the entire dataset.
 * Used by: Date Range Filter (Functionality 1) and B2B vs B2C Comparison (Functionality 3).
 * @see GET /api/metrics/facets
 */
export interface FacetsResponse {
  /** Array of operation type values available in the dataset */
  operation_types: Array<'income' | 'outcome'>;

  /** Array of business type values available in the dataset */
  business_types: Array<'B2B' | 'B2C'>;

  /** Array of transaction category values available in the dataset */
  categories: Category[];

  /**
   * Minimum date in the dataset.
   * Format: YYYY-MM-DD ISO date string.
   * @example "2025-11-01"
   */
  min_date: string;

  /**
   * Maximum date in the dataset.
   * Format: YYYY-MM-DD ISO date string.
   * @example "2026-10-28"
   */
  max_date: string;
}

/**
 * Individual anomaly alert entry (OpenAPI schema: MetricsAlert).
 * Represents a period where spending (outcome) exceeded expected levels.
 * @see GET /api/metrics/alerts
 */
export interface AlertEntry {
  /**
   * Period identifier. Format depends on the group_by query parameter:
   * month (default) YYYY-MM, day YYYY-MM-DD, week YYYY-Www (ISO week).
   * @example "2025-12"
   */
  period: string;

  /**
   * Actual total outcome (spending) for this period.
   * Numeric value in currency units.
   * @example 103378.98
   */
  outcome_total: number;

  /**
   * Cumulative average of outcome_total over all previous periods (not a 3-period moving average).
   * Numeric value in currency units. The first period never produces an alert because it has no baseline.
   * @example 41404.44
   */
  baseline_average: number;

  /**
   * Relative increase over baseline: (outcome_total - baseline_average) / baseline_average.
   * A ratio, not a percentage: 1.4968 means +149.68%.
   * Always greater than the requested threshold, because the endpoint only returns periods above it.
   * @example 1.4968
   */
  increase_ratio: number;
}

/**
 * Alerts response containing list of anomalies detected based on threshold.
 * @see GET /api/metrics/alerts
 */
export type AlertsResponse = AlertEntry[];

/**
 * Individual category entry (OpenAPI schema: TopCategoryItem).
 * Used in top-5 category tables for B2B vs B2C comparison.
 * @see GET /api/metrics/categories/top
 */
export interface CategoryEntry {
  /**
   * Category name. One of the Category values.
   * Income data contains only 'sales' and 'others'.
   * @example "sales"
   */
  category: Category;

  /**
   * Operation type for this entry.
   * Values: 'income' or 'outcome'
   * @example "income"
   */
  operation_type: 'income' | 'outcome';

  /**
   * Total amount for this category and operation type.
   * Numeric value in currency units.
   * @example 1132097.38
   */
  total_amount: number;
}

/**
 * Top categories response containing list of categories sorted by total amount.
 * Limited to specified count (default 5, max 20).
 * Note: May return fewer entries if fewer categories exist for the given filters.
 * @see GET /api/metrics/categories/top
 */
export type TopCategoriesResponse = CategoryEntry[];

/**
 * Summary data point for a period, used in B2B vs B2C comparison chart.
 * Provides aggregated income, outcome, and profit metrics for a business line.
 * @see GET /api/metrics/summary?business_type=B2B|B2C
 */
export interface SummaryDataPoint {
  /**
   * Period identifier (format depends on group_by: default YYYY-MM for monthly).
   * @example "2025-12"
   */
  period: string;

  /**
   * Total income for this period and business type.
   * Numeric value in currency units.
   * @example 500000
   */
  income: number;

  /**
   * Total outcome (spending) for this period and business type.
   * Numeric value in currency units.
   * @example 300000
   */
  outcome: number;

  /**
   * Net profit (income - outcome) for this period and business type.
   * Numeric value in currency units.
   * @example 200000
   */
  net: number;
}

/**
 * Summary response: array of summary data points for a filtered time period.
 * @see GET /api/metrics/summary
 */
export type SummaryResponse = SummaryDataPoint[];

/**
 * Financial movement (transaction) record from the database.
 * Base type used by existing dashboard implementation.
 */
export interface FinancialMovement {
  /** Date of transaction. Format: ISO date string (YYYY-MM-DD) */
  create_date: string;

  /** Transaction amount in currency units */
  amount: number;

  /** Type of financial operation: 'income' or 'outcome' */
  operation_type: 'income' | 'outcome';

  /** Category of transaction */
  category: Category;

  /** Business line: 'B2B' or 'B2C' */
  business_type: 'B2B' | 'B2C';
}

/**
 * Generic metrics response from /api/metrics endpoint.
 * Returns array of financial movements, optionally filtered.
 * @see GET /api/metrics
 */
export type MetricsResponse = FinancialMovement[];
