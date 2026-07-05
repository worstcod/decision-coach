# Changelog

## July 2026 — Full roadmap (Phases 1–4)

### Phase 1 — Trust & polish
- Weight sensitivity analysis (50%–150% sweep per factor)
- Export JSON, printable summary, save to history
- In-app methodology disclaimer
- Mobile tap-to-open tooltips
- Page title, meta description, theme color
- localStorage schema migration (v2 → v3)

### Phase 2 — Decision quality
- **Simple mode** — rate every factor 1–10 with auto-inferred ranges
- **Pairwise weight helper** — compare factors two-at-a-time
- **Must-have (veto) rules** — disqualify options when limits are broken
- **Environment scenarios** — optimistic / pessimistic correlated shifts
- **Win probability 95% CI** — statistical tie detection
- **Multi-currency** — USD, INR, EUR for salary and costs
- **Expanded catalog** — 35+ factors, 6 scenarios per domain (visa, benefits, COL, climate, etc.)

### Phase 3 — Platform & engineering
- **ResultsView** lazy-loaded (code-split bundle)
- **GitHub Actions CI** — test + build on push/PR
- **Seeded simulations** — reproducible runs (seed shown on results)
- **Histograms for all options**
- **Simulation Inspector JSON export**
- **Accessibility** — skip link, ARIA labels, focus styles

### Phase 4 — Differentiation
- **Encrypted share** — password-protected `.dcoach.json` export (Web Crypto)
- **Import decision file** — encrypted or plain JSON from home screen
- **Compare saved decisions** — table on results page
- **Alternative methods** — TOPSIS + Minimax Regret vs Monte Carlo
- **Estimate coaching** — rule-based bias hints on estimates step

### Tests
- 45 automated tests (math engine, catalog, session migration, sensitivity)

---

## July 2026 — Final polish & math transparency

- **[MATH.md](./MATH.md)** — canonical mathematical transparency document (formulas, pipeline, limitations, worked example)
- **`public/MATH.md`** — static copy served at `/MATH.md` on deploy
- **MathDoc modal** — in-app summary; linked from home screen and results page
- **Pairwise Wilson CI** — head-to-head win probability confidence intervals in Simulation Inspector
- **Wizard split** — `src/steps/` (Landing, Domain, Scenario, Options, Weights, Estimates, Simulating)
- **Capacitor polish** — app display name "Decision Coach" (Android + iOS), splash config
- **Docs** — ARCHITECTURE defers to MATH.md; ROADMAP marked complete
