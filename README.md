# Offer Decline Dashboard

An HR analytics dashboard for tracking and analyzing offer declinations. Built in React with Recharts, it surfaces salary gap trends, decline reasons, and campus-level patterns to help inform compensation strategy.

## Current State

Loaded with 15 sample records across 4 campuses (Dallas, Phoenix, Atlanta, Miami). All charts, KPIs, and the data table respond live to the filters at the top of the page.

## Features

### Charts
- **By Campus** — grouped bar chart comparing average offered vs. expected salary per campus
- **By Role** — same comparison broken down by position type
- **Decline Reasons** — horizontal bar breakdown across Compensation, Benefits, Location, and Other Offer
- **Scatter Plot** — every candidate plotted on offered vs. expected axes, color-coded by campus, with a hover tooltip showing name, role, gap amount, and gap percentage

### Data Table
- Full record list with sortable columns (click any header to sort)
- Color-coded campus and decline reason tags
- Salary gap shown in both dollars and percentage

### Filters
Slice the entire view by Campus, Role, or Decline Reason — all charts and KPI cards update instantly.

## Roadmap

- [ ] Replace `SAMPLE_DATA` with a real data source (API or CSV import)
- [ ] CSV / Excel export
- [ ] File upload for bulk data import
- [ ] Live data source integration

## Stack

- React
- Recharts
- Inline styles (DM Mono + Syne fonts)
