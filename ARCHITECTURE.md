# Decision Coach — Architecture (overview)

For **complete mathematical transparency** (formulas, assumptions, limitations), see **[MATH.md](./MATH.md)** — the single canonical reference for what the engine computes internally.

For usage, see **[USER_GUIDE.md](./USER_GUIDE.md)**.

---

## Stack

- **Frontend:** React 19, Vite, Tailwind 4, Recharts, Framer Motion
- **Math:** jStat (Beta distribution), custom Monte Carlo in `src/math-engine/`
- **Storage:** localStorage only (session + history), schema v3
- **Mobile:** Capacitor shell (`android/`, `ios/`) wrapping `dist/`

---

## Application structure

```
src/
├── App.jsx                 # Wizard state machine, orchestration
├── steps/                  # Landing, domain, scenario, options, weights, estimates, …
├── ResultsView.jsx         # Lazy-loaded results dashboard
├── MathDoc.jsx             # In-app math summary modal
├── math-engine/            # Simulation, statistics, sensitivity, alternatives
├── factorCatalog.js        # Domains, scenarios, factor library
├── criterionTypes.js       # Measurement types, validation
└── sessionStorage.js       # Persist + migrate sessions
```

---

## Data flow

1. User input → normalized weights + PERT triples stored in state
2. Optional macro shift + veto rules applied at simulation time
3. `runSimulation()` → 10,000 iterations → aggregated results + Wilson CIs
4. `generateInsights()` → human-readable warnings
5. Sensitivity / TOPSIS / minimax run as secondary analyses

See **MATH.md §2–7** for the full pipeline and formulas.

---

## Deployment

- **Web:** GitHub Pages (`.github/workflows/deploy.yml`)
- **CI:** `.github/workflows/ci.yml` (test + build)
- **Static math doc:** `public/MATH.md` served at `/MATH.md`

---

*July 2026*
