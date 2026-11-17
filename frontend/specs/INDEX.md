# Frontend Specifications Index

This directory contains complete, verified specifications for three new dashboard features. All specifications are ready for implementation by a coding agent.

## Quick Navigation

| File | Purpose | Lines | Key Content |
|------|---------|-------|-------------|
| [`api-types.ts`](./api-types.ts) | API Response Types | 185 | `FacetsResponse`, `AlertEntry`, `AlertsResponse`, `CategoryEntry`, `TopCategoriesResponse`, `SummaryDataPoint`, `SummaryResponse` |
| [`param-types.ts`](./param-types.ts) | Query Parameter Types | 166 | `DateRangeFilter` (base), `AlertsParams`, `TopCategoriesParams`, `SummaryParams`, `MetricsParams`, `FacetsParams` |
| [`components.md`](./components.md) | UI Component Specs | 405 | Component names, props, layout, conditional rendering for all 5 components |
| [`README.md`](./README.md) | Data Contract & Endpoints | 579 | Detailed endpoint specs, parameter restrictions, 5-6 edge cases per feature |
| [`VERIFICATION.md`](./VERIFICATION.md) | API Exploration & Verification | 288 | Live API responses, OpenAPI mapping, design decisions, resolution of PM brief vs reality |
| `INDEX.md` | This file | - | Navigation guide |

## Three Features at a Glance

### 🗓️ Feature 1: Date Range Filter
- **Endpoints**: `GET /api/metrics/facets` (get min/max date), `GET /api/metrics?start_date=...&end_date=...`
- **Components**: `DateRangeFilter`
- **Edge cases**: 5 documented (single date set, both empty, invalid range, out of bounds, etc.)
- **Specs**: `components.md` (lines 1-72), `README.md` (lines 1-130)

### 🚨 Feature 2: Anomaly Alerts Table
- **Endpoints**: `GET /api/metrics/alerts?threshold=0.3&...`
- **Components**: `AnomalyAlertsTable`
- **Columns**: period, outcome_total, baseline_average, increase_ratio (fracción; `* 100` para %)
- **Edge cases**: 6 documented (low threshold, high threshold, negative input, no data, etc.)
- **Specs**: `components.md` (lines 73-250), `README.md` (lines 131-350)

### 📊 Feature 3: B2B vs B2C Comparison
- **Endpoints**: `GET /api/metrics/categories/top?operation_type=income&...` (2 calls), `GET /api/metrics/summary?business_type=...` (2 calls)
- **Components**: `ComparisonPage`, `TopCategoriesPanel`, `ComparisonChart`
- **Tables**: Categories per business line (máx. 2 filas de ingreso en los datos actuales) with % of group total
- **Chart**: Income comparison B2B vs B2C by period
- **Edge cases**: 6 documented (empty panels, single business line, limit=1, etc.)
- **Specs**: `components.md` (lines 251-405), `README.md` (lines 351-579)

## How to Use These Specs

### For Implementation
1. Read `README.md` for complete endpoint and parameter documentation
2. Reference `api-types.ts` and `param-types.ts` for TypeScript interfaces
3. Use `components.md` for component structure and conditional rendering
4. Check `VERIFICATION.md` if you need to understand why a parameter is defined a certain way

### For Code Review
1. Verify component names match `components.md`
2. Verify types match `api-types.ts` and `param-types.ts`
3. Verify edge cases from README.md are handled (5-6 per feature)
4. Verify empty states are explicit (not hidden tables)
5. Verify single-date edge case in Feature 1 is handled

### For Bug Investigation
1. Find the edge case in `README.md` corresponding to the bug report
2. Check the expected behavior in the edge case description
3. Consult `VERIFICATION.md` for API details

## TypeScript Compilation

All types are verified to compile without errors:
```bash
cd frontend
npx tsc --noEmit
# Success: no errors
```

## Commit History

```
79c598e Add API exploration and verification documentation
dec3f10 Add data contract documentation for all three features
1786f12 Add component specifications for three features
cb09493 Add TypeScript API and parameter types for three new features
```

Each commit is self-contained and covers one aspect:
1. Types (api-types.ts, param-types.ts)
2. Components (components.md)
3. Data Contract (README.md)
4. Verification (VERIFICATION.md)

## Key Design Decisions

See `VERIFICATION.md` for detailed justification of:
- **DateRangeFilter as reusable base** — Avoids duplication across AlertsParams, TopCategoriesParams, SummaryParams
- **increase_ratio as number** — Stored as 1.4968 (not "49.68%") to sync with API
- **baseline_average clarity** — Not a fixed 3-period moving average; algorithm output documented
- **threshold range** — API accepts >= 0 with no max; UI enforces 0.01-1.0 (see components.md)
- **limit range: 1-20** — API restriction documented; API may return fewer results

## API Verification

Backend endpoint documentation:
- **OpenAPI Schema**: http://localhost:8000/openapi.json
- **Interactive Docs**: http://localhost:8000/docs
- **Backend Service**: http://localhost:8000

All endpoints tested against live API and documented in `VERIFICATION.md`.

## Ready for Implementation ✅

A coding agent can implement all three features using **only these specifications** without asking clarifying questions:

✅ Component names and props are unambiguous  
✅ API endpoints and parameters are verified  
✅ Edge cases and empty states are pre-specified  
✅ Type signatures compile with strict TypeScript  
✅ No assumptions need to be made  

---

**Last Updated**: 2026-11-17  
**Status**: Ready for implementation  
**Coverage**: 3 features, 1,623 lines of spec, 72KB
