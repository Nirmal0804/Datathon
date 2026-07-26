# Socio-economic Crime Correlation (Module 10) - Walkthrough

I have integrated the strategic **Socio-economic Crime Correlation** module into the Intelligence Analyst workspace.

---

## Technical Implementations

### 1. Mock Datasets Registry
- **Socio-economic Indicators** (`socioEconomicData.js`): Maps literacy rates, population numbers, average household incomes, employment, and urbanization factors across Karnataka districts.
- **Correlation Coefficients Matrix** (`crimeCorrelationData.js`): Stores Pearson correlation metrics between crime classifications and indicators.

### 2. Analytical Workspace & Layout (`SocioEconomicCorrelation.jsx`)
- **Filters**: District, Crime Category, Year, Indicator, and Correlation Threshold.
- **Pearson Heatmap Grid**: Color-coded cell matrix ranging from `-1.0` (Strong Negative - blue scale) through `0.0` (Neutral) to `+1.0` (Strong Positive - red scale).
- **Interactive SVG Scatter Plot**:
  - Plots Crime Rate (Y-axis) vs Selected indicator (X-axis).
  - Dots correspond to Karnataka districts.
  - Hovering displays: District Name, Indicator Value, Crime Rate, and Correlation Index.
- **District Rankings & Coefficient Tables**: Compiles ranked indicators and Pearson coefficients tables.
- **AI Insights & Disclaimer**: Displays demo strategic observations alongside the required banner stating: *"Correlation indicates statistical association only and does NOT imply causation."*

### 3. Exporters
- **PDF Report**: Generates and downloads valid binary PDFs (`Crime_Report_YYYY-MM-DD.pdf`) using `jsPDF`.
- **CSV Matrix**: Triggers standard browser file download (`Crime_Report_YYYY-MM-DD.csv`).

### 4. Sidebar Navigation & Routing
- Restricts visibility to the Intelligence Analyst role only.
- Mapped routing path `"correlation"` in `DashboardLayout.jsx` to render:
  ```jsx
  <SocioEconomicCorrelation role={role} />
  ```

---

## Compilation Status

- Compiled successfully under Vite:
  ```text
  vite v8.1.5 building client environment for production...
  transforming...✓ 2513 modules transformed.
  rendering chunks...
  dist/index.html                          0.47 kB
  dist/assets/index-DBhUY8VF.css          86.38 kB
  dist/assets/purify.es-DuRL7t6i.js       26.87 kB
  dist/assets/index.es-B6CxaLaP.js       151.32 kB
  dist/assets/html2canvas-HLqCQkO8.js    199.55 kB
  dist/assets/index-DpEqtyxc.js        1,362.76 kB
  ✓ built in 2.56s
  ```
