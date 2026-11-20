/**
 * API Response Types for Dashboard Financial Specifications
 * All types are verified against OpenAPI schema (http://localhost:8000/openapi.json)
 * and tested against live API responses.
 */

/**
 * Facets response containing available values and date range for the entire dataset.
 * Used by: Date Range Filter (Functionality 1) and B2B vs B2C Comparison (Functionality 3).
 * @see GET /api/metrics/facets
 */
export interface FacetsResponse {
  /** Array of operation type values available in the dataset */
  operation_types: Array<'income' | 'outcome'>;

  /** Array of business type values available in the dataset */
  business_types: Array<'B2B' | 'B2C'>;

  /** Array of transaction category values available in the dataset */
  categories: string[];

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
 * Individual anomaly alert entry.
 * Represents a period where spending (outcome) exceeded expected levels.
 * @see GET /api/metrics/alerts
 */
export interface AlertEntry {
  /**
   * Period identifier. Format depends on group_by parameter (default is monthly).
   * Default format: YYYY-MM (month)
   * Also supports: YYYY-MM-DD (day), or week format depending on API grouping
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
   * Historical average of previous periods used as baseline for comparison.
   * Numeric value in currency units.
   * This is NOT a fixed 3-period moving average; it represents the statistical baseline
   * calculated by the backend anomaly detection algorithm.
   * @example 41404.44
   */
  baseline_average: number;

  /**
   * Ratio of actual outcome vs baseline (outcome_total / baseline_average).
   * Values > 1.0 indicate spending above baseline.
   * Values < 1.0 indicate spending below baseline.
   * Example: 1.4968 means 49.68% above baseline; 0.3632 means 63.68% below baseline.
   * @example 1.4968
   */
  increase_ratio: number;
}

/**
 * Alerts response containing list of anomalies detected based on threshold.
 * @see GET /api/metrics/alerts
 */
export interface AlertsResponse extends Array<AlertEntry> {}

/**
 * Individual category entry with aggregated metrics for a business type.
 * Used in top-5 category tables for B2B vs B2C comparison.
 * @see GET /api/metrics/categories/top
 */
export interface CategoryEntry {
  /**
   * Category name (e.g., 'sales', 'suppliers', 'administrative').
   * Valid values provided by FacetsResponse.categories
   * @example "sales"
   */
  category: string;

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
export interface TopCategoriesResponse extends Array<CategoryEntry> {}

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
export interface SummaryResponse extends Array<SummaryDataPoint> {}

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
  category: string;

  /** Business line: 'B2B' or 'B2C' */
  business_type: 'B2B' | 'B2C';
}

/**
 * Generic metrics response from /api/metrics endpoint.
 * Returns array of financial movements, optionally filtered.
 * @see GET /api/metrics
 */
export interface MetricsResponse extends Array<FinancialMovement> {}
