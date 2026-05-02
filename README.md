# Sourced Candidates Not Interested Dashboard

An HR analytics dashboard for tracking and analyzing offer declinations across Cotulla Education / Quad campuses. Built in React with Recharts, deployed on Azure Static Web Apps.

**Live:** https://thankful-wave-02bec7f10.azurestaticapps.net

## Features

### KPI Tiles
- **Total Declinations** — count of records in the current filtered view
- **Avg. Salary Gap** — average difference between expected and offered salary (salary-only records)
- **Compensation-Driven** — percentage of declines attributed to pay/compensation
- **Decline Reasons Donut** — compact breakdown of all decline categories with hover tooltips

### Charts
- **By Campus** — horizontal bar chart comparing avg offered vs. expected salary per campus (campus codes on Y-axis, paginated)
- **By Role** — same comparison broken down by position type (paginated)
- **Decline Trend** — monthly bar chart of declinations over time with a drag scrubber to select a time window; filters the entire dashboard
- **Salary Gap Analysis** — avg gap by campus, color-coded by severity (High/Mid/Low/Min), paginated

### Campus Spotlight
When a single campus is selected and applied, a comparison card appears showing that campus's avg offered salary, avg expected salary, and avg gap vs. the overall dataset average. Displays "More data coming soon" if fewer than 3 salary records exist for that campus.

### Filters
All filters work together with a staged Apply/Clear pattern — changes stage in the UI and only take effect when Apply is clicked.

- **Campus** — multi-select, shows campus codes (AMC, AMD, etc.)
- **Role** — multi-select
- **Sourcing** — multi-select (LinkedIn, Indeed, Alumni, Referral, Email, Other)
- **Decline Reason** — single-select dropdown
- **From / To** — month calendar pickers for date range filtering; syncs with the Decline Trend brush scrubber

### Data Table
- Full record list, sortable by any column
- Pagination (25 records per page)
- Color-coded campus and decline reason tags
- Salary gap in dollars and percentage, hourly rate shown under annual figures
- Click any row with feedback to open the full notes modal
- **Export CSV** — downloads the current filtered view

### Theming
Light/dark mode toggle; preference saved to localStorage.

## Data Pipeline

- CSV loaded from `public/data.csv` at runtime via PapaParse
- Campus codes normalized to full names via `src/campuses.js` (`CAMPUS_MAP`)
- Salary fields parsed from raw strings — handles K-notation, ranges, and hourly rates
- Offered/expected values swapped at parse time if entered backwards (data entry correction)
- Records missing role, name, or campus are filtered out
- Decline reason inferred from free-text notes via keyword matching (`src/feedbackThemes.js`) when the Issue Type column is blank; inferred records marked with ✦ in the table

## Stack

- React 18 + Vite 5
- Recharts (BarChart, PieChart, Brush)
- PapaParse (CSV parsing)
- Inline styles throughout, theme-driven via `src/themes.js`
- Inter font (Google Fonts)
- Azure Static Web Apps (CI/CD via GitHub Actions on push to master)

## Roadmap

- [ ] OpenAI-powered AI insights panel — plain-English summary of current filtered data
- [ ] File upload for bulk data import / CSV refresh
- [ ] Live data source integration
