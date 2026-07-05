# Decision Coach — User Guide

Privacy-first decision support using **Monte Carlo simulation** and **weighted factors**. Everything runs in your browser; data stays on your device.

**Math transparency:** [MATH.md](./MATH.md) — full formulas and assumptions.

For technical details see [ARCHITECTURE.md](./ARCHITECTURE.md). For release history see [CHANGELOG.md](./CHANGELOG.md).

---

## Quick start

1. Open the app → **Start Decision**
2. Pick **domain** (Job, Finance, Life, or Custom)
3. Pick **scenario** (or skip for Custom)
4. Name **2–5 options**
5. Check **factors** that matter
6. Set **weights** (sliders or pairwise helper)
7. Enter **estimates** → **Analyze Decision**
8. Read **results**, save or export if needed

---

## Wizard steps explained

### Domain & scenario

| Domain | Examples |
|--------|----------|
| Job / Career | Offers, startup vs corporate, international move |
| Finance | Invest vs debt, rent vs buy, savings vehicles |
| Life | Relocation, education, lifestyle, family |
| Custom | Pick any factors from the full library |

Each guided domain has **6 scenarios** with pre-selected factors you can change.

### Factors

- **Suggested** factors are pre-checked for your scenario
- **Uncheck** what doesn't apply (e.g. commute if fully remote)
- **Add custom factors** with a measurement type (1–10, salary, minutes, etc.)
- Need at least **2 factors**

### Weights

- Sliders set **relative importance** (auto-normalized to percentages)
- **Pairwise helper** — answer “which matters more?” for each pair
- **Must-have rules** (optional) — hard limits that disqualify an option in a simulation (e.g. commute must not exceed 60 min)

### Estimates

**Standard mode** — three numbers per option × factor:

| Label | Meaning |
|-------|---------|
| If things go badly | Realistic worst case |
| Most likely | Honest expected value |
| If things go well | Realistic best case |

**Order:** higher-is-better → low to high; lower-is-better (cost, stress) → high to low.

**Simple mode** — one slider 1–10 per factor; bad/good ranges inferred automatically.

**Currency** — USD, INR, or EUR for salary and one-time costs.

**Environment scenario** — shifts all factors together:
- *Optimistic* — positive factors trend up, costs/risks down
- *Pessimistic* — the opposite
- *Neutral* — your numbers as entered

**Estimate coaching** — hints if ranges are too narrow or a veto rule might help.

**Advanced:** risk profile (averse / neutral / seeking) affects win probability.

---

## Reading results

### Recommendation card

| Metric | Meaning |
|--------|---------|
| Win probability | % of 10,000 simulations where this option wins (after risk profile) |
| 95% CI | Statistical range for win rate — overlapping CIs suggest a tie |
| Confidence | High / Medium / Low based on win rate and ties |
| Expected utility | Average score after your risk curve |

### Method comparison

Three approaches side-by-side:

| Method | Uses |
|--------|------|
| **Monte Carlo** | Your full uncertainty ranges — primary recommendation |
| **TOPSIS** | Most-likely estimates only — distance to ideal |
| **Minimax Regret** | Most-likely estimates — minimizes worst-case gap per factor |

If methods disagree, the decision is genuinely close or uncertainty matters.

### Other sections

- **Human Take** — plain-language summary
- **Weight sensitivity** — would the winner change if priorities shifted ±50%?
- **Simulation Inspector** — audit sample runs step-by-step
- **Outcome histograms** — score distributions for every option
- **Outcome paths** — 10th / 50th / 90th percentile scores

---

## Save, export, share

| Action | Where | What it does |
|--------|-------|--------------|
| Save | Results toolbar | Names decision → appears on home screen |
| Export JSON | Results | Full audit file |
| Encrypted | Results | Password-protected share file |
| Print | Results | Printable summary |
| Compare | Results | Table vs saved decisions |
| Import | Home screen | Load JSON or encrypted file |

---

## Tips

1. Be honest on **most likely** — the simulation centers there
2. Widen ranges when uncertain
3. Use **must-have rules** for true deal-breakers
4. Low confidence or statistical tie → trust your gut on unmodeled factors
5. Use **Simulation Inspector** on close decisions
6. **Simulation seed** on results lets you reproduce the same run

---

## Limitations

- Factors are independent unless you use an environment scenario
- Compensatory weighting — high salary can offset bad commute unless vetoed
- Not professional financial, legal, or career advice
- Estimates are only as good as your judgment

---

## FAQ

**Simple vs standard mode?**  
Simple is faster (1–10 sliders). Standard captures uncertainty properly — preferred for high-stakes decisions.

**Why 10,000 simulations?**  
Enough for stable win percentages; sensitivity checks use fewer for speed.

**Can I trust a 52% win rate?**  
Check the confidence interval. If it overlaps with another option, treat it as a toss-up.

**What’s the encrypted file?**  
AES-GCM encrypted JSON using your password. No server — share the file + password out of band.

---

*Last updated: July 2026*
