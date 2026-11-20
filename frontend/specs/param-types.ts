/**
 * Query Parameter Types for Dashboard Financial Specifications
 * All types are verified against OpenAPI schema (http://localhost:8000/openapi.json)
 * and represent actual parameter requirements from live API.
 */

import type { Category } from './api-types';

/**
 * Date range filter parameters.
 * Base type used by multiple endpoints to filter data by date range.
 * Both fields are optional; when empty, the full dataset is used.
 */
export interface DateRangeFilter {
  /**
   * Start of date range (inclusive).
   * Format: YYYY-MM-DD ISO date string.
   * Optional; when omitted, no lower date bound is applied.
   * @example "2025-11-01"
   */
  start_date?: string;

  /**
   * End of date range (inclusive).
   * Format: YYYY-MM-DD ISO date string.
   * Optional; when omitted, no upper date bound is applied.
   * @example "2026-10-28"
   */
  end_date?: string;
}

/**
 * Query parameters for alerts endpoint.
 * Used to fetch anomaly detection results based on threshold and optional date/business type filters.
 * @see GET /api/metrics/alerts
 */
export interface AlertsParams extends DateRangeFilter {
  /**
   * Anomaly detection threshold ratio.
   * Flags a period when increase_ratio > threshold. Ratio, not a percentage (0.3 = 30%).
   * API accepts any number >= 0 (no maximum). Values below 0 return HTTP 422.
   * UI-enforced range: 0.01 to 1.0 (PM requirement). The UI must reject out-of-range input.
   * @default 0.3
   * @minimum 0
   * @example 0.3
   */
  threshold?: number;

  /**
   * Optional business line filter.
   * Values: 'B2B' or 'B2C'.
   * When omitted, alerts for all business types are returned.
   * @example "B2B"
   */
  business_type?: 'B2B' | 'B2C';

  /**
   * Time period granularity for grouping.
   * Values: 'day', 'week', 'month' (default).
   * @default "month"
   * @example "month"
   */
  group_by?: 'day' | 'week' | 'month';
}

/**
 * Query parameters for top categories endpoint.
 * Used to fetch the top-N highest-spending or highest-income categories for a business line.
 * @see GET /api/metrics/categories/top
 */
export interface TopCategoriesParams extends DateRangeFilter {
  /**
   * Type of financial operation to rank categories by.
   * Values: 'income' (revenue) or 'outcome' (spending).
   * @default "outcome"
   * @example "income"
   */
  operation_type?: 'income' | 'outcome';

  /**
   * Maximum number of top categories to return.
   * Numeric value: minimum 1, maximum 20.
   * OpenAPI defines this as integer with min/max constraints.
   * Note: API may return fewer results if fewer categories exist for the given filters.
   * @default 5
   * @minimum 1
   * @maximum 20
   * @example 5
   */
  limit?: number;

  /**
   * Optional business line filter.
   * Values: 'B2B' or 'B2C'.
   * When omitted, top categories for all business types are aggregated together.
   * @example "B2B"
   */
  business_type?: 'B2B' | 'B2C';
}

/**
 * Query parameters for summary endpoint.
 * Used to fetch aggregated metrics (income, outcome, net) by period and business type.
 * @see GET /api/metrics/summary
 */
export interface SummaryParams extends DateRangeFilter {
  /**
   * Business line to summarize.
   * Values: 'B2B' or 'B2C'.
   * When omitted, summary for all business types combined is returned.
   * @example "B2B"
   */
  business_type?: 'B2B' | 'B2C';

  /**
   * Time period granularity for grouping.
   * Values: 'day', 'week', 'month' (default).
   * @default "month"
   * @example "month"
   */
  group_by?: 'day' | 'week' | 'month';

  /**
   * Optional category filter.
   * Category to include. Valid values: Category.
   * @example "sales"
   */
  category?: Category;

  /**
   * Optional operation type filter.
   * Values: 'income' or 'outcome'.
   * When specified, only records of this type are included in the summary.
   * @example "income"
   */
  operation_type?: 'income' | 'outcome';
}

/**
 * Query parameters for metrics endpoint.
 * Used to fetch individual financial movement records with optional filtering.
 * @see GET /api/metrics
 */
export interface MetricsParams extends DateRangeFilter {
  /**
   * Optional category filter.
   * Category to include. Valid values: Category.
   * @example "sales"
   */
  category?: Category;

  /**
   * Optional operation type filter.
   * Values: 'income' or 'outcome'.
   * @example "income"
   */
  operation_type?: 'income' | 'outcome';
}

/**
 * Query parameters for facets endpoint.
 * No parameters required; this endpoint always returns the full set of available values and date range.
 * @see GET /api/metrics/facets
 */
export type FacetsParams = Record<string, never>;
