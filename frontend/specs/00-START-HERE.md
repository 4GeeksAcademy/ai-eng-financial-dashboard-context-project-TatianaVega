# 🚀 START HERE

This directory contains **complete, verified specifications** for three new dashboard features.

## For the Implementer (Coding Agent)

**You need exactly these specs to build all three features with zero questions:**

### Step 1: Read the Data Contract
📖 [`README.md`](./README.md) — All endpoints, parameters, and edge cases

- Functionality 1: Date Range Filter (GET /api/metrics/facets, /api/metrics with filters)
- Functionality 2: Anomaly Alerts Table (GET /api/metrics/alerts)
- Functionality 3: B2B vs B2C Comparison (GET /api/metrics/categories/top + /api/metrics/summary)

### Step 2: Reference the Types
📋 [`api-types.ts`](./api-types.ts) — API response interfaces  
📋 [`param-types.ts`](./param-types.ts) — Query parameter interfaces

Copy these directly into your project. No modifications needed.

### Step 3: Build the Components
🎨 [`components.md`](./components.md) — Component names, props, layout, behavior

For each feature:
- Component name and props interface
- Conditional rendering logic (loading, error, empty states)
- Table columns, chart axis, button behavior
- Edge case handling

### Step 4: Handle Edge Cases
⚠️ Every feature has 5-6 documented edge cases in [`README.md`](./README.md)

Don't skip these—they're in the specs because they affect real users.

---

## For the Code Reviewer

**Verification checklist:**

- [ ] Component names match [`components.md`](./components.md)
- [ ] Types match [`api-types.ts`](./api-types.ts) and [`param-types.ts`](./param-types.ts)
- [ ] All 5-6 edge cases per feature are handled (see [`README.md`](./README.md))
- [ ] Empty states show explicit message (not hidden tables)
- [ ] Single-date edge case in Feature 1 is handled
- [ ] Threshold validation in Feature 2 rejects negative values
- [ ] Feature 3 panels show empty state when no categories

---

## For the Tech Lead

**Confidence level: HIGH ✅**

All specifications are:
- ✅ Verified against OpenAPI schema (http://localhost:8000/openapi.json)
- ✅ Tested against live API responses
- ✅ Fully typed (strict TypeScript, zero `any` types)
- ✅ Compiled and verified (npx tsc --noEmit)
- ✅ Documented with 17 total edge cases
- ✅ PM brief corrections documented (threshold range, media móvil clarification, limit bounds)

A coding agent can implement these specs **without asking clarifying questions**.

---

## 📚 File Guide

| File | For Whom | Purpose |
|------|----------|---------|
| **INDEX.md** | Everyone | Navigation guide (read this if you're new) |
| **README.md** | Implementer | Detailed endpoints, parameters, edge cases |
| **api-types.ts** | Implementer | API response TypeScript interfaces |
| **param-types.ts** | Implementer | Query parameter TypeScript interfaces |
| **components.md** | Implementer | React component specs with props |
| **VERIFICATION.md** | Tech Lead | API exploration trace, design decisions |
| **00-START-HERE.md** | Everyone | This file |

---

## ⚡ Quick Reference

### Feature 1: Date Range Filter
- **Component**: `DateRangeFilter`
- **Endpoint**: `GET /api/metrics/facets` (get min/max date)
- **Props**: `startDate`, `endDate`, `onStartDateChange`, `onEndDateChange`, `minDateAvailable`, `maxDateAvailable`
- **Edge Cases**: 5 (single date, both empty, invalid range, out of bounds, etc.)

### Feature 2: Anomaly Alerts Table
- **Component**: `AnomalyAlertsTable`
- **Endpoint**: `GET /api/metrics/alerts?threshold=...`
- **Columns**: period, outcome_total, baseline_average, increase_ratio (as %)
- **Props**: `alerts`, `threshold`, `onThresholdChange`, `loading`, `error`
- **Edge Cases**: 6 (low threshold, high threshold, negative input, no data, etc.)

### Feature 3: B2B vs B2C Comparison
- **Components**: `ComparisonPage`, `TopCategoriesPanel`, `ComparisonChart`
- **Endpoints**: `GET /api/metrics/categories/top` (2×) + `GET /api/metrics/summary` (2×)
- **Props**: Business type, categories array, chart data, date filters
- **Edge Cases**: 6 (empty panels, single business line, limit=1, etc.)

---

## 🔗 Important Links

- **Repository**: https://github.com/4GeeksAcademy/ai-eng-financial-dashboard-context-project-TatianaVega
- **Branch**: `feature/frontend-specs`
- **API Docs**: http://localhost:8000/docs (when backend is running)
- **OpenAPI Schema**: http://localhost:8000/openapi.json

---

## ✅ Ready to Build?

1. **Read** [`README.md`](./README.md) (15 min)
2. **Reference** [`api-types.ts`](./api-types.ts) and [`param-types.ts`](./param-types.ts) (copy-paste)
3. **Build** using [`components.md`](./components.md) (the components)
4. **Test** against 5-6 edge cases per feature

**Estimated build time**: 4-6 hours for all three features

---

## Questions?

- **Why is the API endpoint parameter `threshold` and not `sensitivity`?** → See VERIFICATION.md
- **Why does `increase_ratio` come back as a number and not a percentage string?** → See VERIFICATION.md
- **What if the API returns fewer than 5 categories in Feature 3?** → See README.md, Functionality 3, Restriction table
- **How should I handle the case where only one date is set in Feature 1?** → See README.md, Functionality 1, Case Limit 1

All answers are in the specs. No guessing required.

---

**Version**: 1.0  
**Status**: Ready for implementation  
**Last Updated**: 2026-11-17
