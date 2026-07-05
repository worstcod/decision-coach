# Decision Coach — Mathematical Transparency

This document explains **exactly** what the app computes internally: inputs, formulas, assumptions, and limitations. No black boxes.

**Implementation:** `src/math-engine/` · **10,000 iterations** by default · **All computation is local** in your browser.

---

## 1. What kind of problem is this?

Decision Coach solves a **multi-criteria decision under uncertainty** problem:

- You have **options** (choices A, B, …)
- Each option is scored on **factors** (salary, commute, happiness, …)
- Each factor has **importance (weight)** and **uncertainty (range of values)**
- The engine finds which option wins most often when the future is simulated many times

This is **not** machine learning and **not** trained on your data. It is **your** numbers run through **published statistical methods** (Beta-PERT, Monte Carlo, Wilson intervals, TOPSIS, minimax regret).

---

## 2. Pipeline overview

```
YOUR INPUTS                    PER ITERATION (×10,000)              AGGREGATE OUTPUT
─────────────                  ───────────────────────              ────────────────
Options (2–5)        ──►      Sample each factor (Beta-PERT)  ──► Win probability + 95% CI
Factors + weights    ──►      Normalize to 0–1                ──► Expected utility, regret
Estimates min/mode/max ──►      Weighted sum → total score      ──► Percentiles, histograms
Risk profile         ──►      Apply utility curve             ──► Insights & warnings
Veto rules (optional)──►      Disqualify if violated          ──► Sensitivity analysis
Macro scenario       ──►      (shifts inputs before sim)      ──► TOPSIS / minimax (side)
```

---

## 3. Your inputs and how they are stored

### 3.1 Options

Plain labels: `"Startup"`, `"Big Corp"`, etc. Up to 5 options.

### 3.2 Factors (criteria)

Each factor has:

| Field | Meaning |
|-------|---------|
| `name` | e.g. "Salary / Compensation" |
| `weight` | Raw importance points (normalized later) |
| `isPositive` | `true` = higher values are better; `false` = lower is better (commute, cost) |
| `measureType` | How numbers are entered (USD salary, 1–10 rating, minutes, …) |

**Weight normalization** (before simulation):

\[
w_j = \frac{\text{raw weight}_j}{\sum_k \text{raw weight}_k}
\]

So weights always sum to **1.0** inside the engine. Giving two factors 50+50 is identical to 10+10.

### 3.3 Three-point estimates (standard mode)

For each **option × factor**, you enter:

| Stored as | UI label | Role |
|-----------|----------|------|
| `min` | If things go badly | PERT minimum |
| `mode` | Most likely | PERT mode (peak density) |
| `max` | If things go well | PERT maximum |

**Validation:**

- Higher-is-better: `min ≤ mode ≤ max`
- Lower-is-better: `min ≥ mode ≥ max` (bad = large number)

### 3.4 Simple mode

You enter one rating 1–10 (the **mode**). The engine sets:

- Higher-is-better: `min = likely − 2`, `max = likely + 2` (clamped to 1–10)
- Lower-is-better: reversed

Then the same PERT sampling applies.

### 3.5 Environment scenario (macro)

Before simulation, all three points for every factor are shifted by **±12%**:

- **Optimistic:** positive factors increase, negative factors decrease (better)
- **Pessimistic:** opposite
- **Neutral:** no change

This models **correlated** good/bad environments. Factors still sample independently *within* that shifted range.

### 3.6 Must-have (veto) rules

Optional per factor:

- **Must be at least** *T* (higher-is-better factors)
- **Must not exceed** *T* (lower-is-better factors)

If a **sampled value** in one iteration violates the rule, that option's utility for that iteration is set to **−1** (effectively eliminated for that run).

---

## 4. Global scaling (normalization bounds)

Before sampling, for each factor the engine finds across **all options**:

\[
G^{\min}_j = \min(\text{all min, mode, max for factor } j), \quad
G^{\max}_j = \max(\text{all min, mode, max for factor } j)
\]

Every sampled raw value \(x\) for factor \(j\) is mapped to a **utility contribution** in \([0,1]\):

**Higher-is-better:**

\[
n(x) = \frac{x - G^{\min}_j}{G^{\max}_j - G^{\min}_j}
\]

**Lower-is-better:**

\[
n(x) = 1 - \frac{x - G^{\min}_j}{G^{\max}_j - G^{\min}_j}
\]

If \(G^{\max}_j = G^{\min}_j\), the score is treated as **1** (no discrimination on that factor).

This lets salary (thousands) and happiness (1–10) live on the same 0–1 scale.

---

## 5. Beta-PERT sampling (uncertainty)

Each iteration, for each option × factor, one value is drawn from a **Beta-PERT** distribution defined by \((min, mode, max)\).

### 5.1 PERT mean and spread (λ = 4)

\[
\mu = \frac{min + 4 \cdot mode + max}{6}, \qquad
\sigma = \frac{max - min}{6}
\]

### 5.2 Beta shape parameters

\[
v = \frac{(\mu - min)(max - \mu)}{\sigma^2} - 1
\]

\[
\alpha = \max\left(0.1,\; \frac{\mu - min}{max - min} \cdot v\right), \qquad
\beta = \max\left(0.1,\; \frac{max - \mu}{max - min} \cdot v\right)
\]

### 5.3 Sample

\[
x = min + \text{Beta}(\alpha, \beta) \cdot (max - min)
\]

**Why PERT?** The **mode** (your "most likely") gets the highest probability mass, but tails toward min/max are possible — matching how people think about ranges.

**Independence assumption:** Each factor is sampled **independently** in each iteration (except macro shift applied upfront). Real-world factors (salary & equity) may correlate; the macro scenario partially addresses this.

---

## 6. One simulation iteration (single "universe")

For each option \(i\):

1. **Sample** raw value \(x_{ij}\) for every factor \(j\)
2. **Check veto** — if violated, mark option disqualified
3. **Normalize** \(n_{ij} = n(x_{ij})\) using global bounds
4. **Weight** contribution \(c_{ij} = w_j \cdot n_{ij}\)
5. **Total score** (compensatory weighted sum):

\[
S_i = \sum_j c_{ij} \quad \text{(range typically } [0,1]\text{)}
\]

6. **Risk utility** transform \(U(S_i)\):

| Profile | Formula \(U(x)\) | Effect |
|---------|------------------|--------|
| Neutral | \(U(x) = x\) | Linear |
| Risk-averse | \(U(x) = \dfrac{\ln(1+9x)}{\ln(10)}\) | Concave — dampens upside, values stability |
| Risk-seeking | \(U(x) = x^2\) | Convex — rewards high scores more |

If veto violated: \(U = -1\).

7. **Winner** of this iteration = option with **maximum** \(U(S_i)\). Ties broken uniformly at random (seeded if reproducibility seed set).

**Margin** in this iteration = top utility minus second utility (used for "closest call" sample runs).

---

## 7. Monte Carlo aggregation (10,000 iterations)

After \(N = 10{,}000\) iterations:

### 7.1 Win probability

\[
P_{\text{win}}(i) = \frac{\text{# iterations where option } i \text{ won}}{N}
\]

Winner recommendation = option with highest \(P_{\text{win}}\) (after utility, not raw score).

### 7.2 Wilson 95% confidence interval

Win count \(k_i\), trials \(N\). Wilson score interval (z = 1.96):

\[
\text{denom} = 1 + \frac{z^2}{N}, \quad
\hat{p} = \frac{k_i}{N}
\]

\[
\text{center} = \frac{\hat{p} + z^2/(2N)}{\text{denom}}, \quad
\text{margin} = \frac{z \sqrt{(\hat{p}(1-\hat{p}) + z^2/(4N))/N}}{\text{denom}}
\]

\[
CI = [\max(0,\; \text{center} - \text{margin}),\; \min(1,\; \text{center} + \text{margin})]
\]

**Statistical tie:** if the top two options' Wilson intervals **overlap**, the app flags that the lead may not be distinguishable from noise.

### 7.3 Head-to-head (pairwise) win rates

For each pair (A, B), count iterations where A's utility > B's, B > A, or tie. Each rate gets its own Wilson CI.

### 7.4 Expected utility & regret

- **Expected utility** = mean of \(U(S_i)\) across iterations
- **Expected regret** for option \(i\) = mean of \(\max_j U(S_j) - U(S_i)\)

### 7.5 Downside risk

Let \(\bar{U}_i\) = mean utility, \(\sigma_i\) = std dev of utility scores.

\[
\text{Downside risk}_i = P(U(S_i) < \bar{U}_i - \sigma_i)
\]

### 7.6 Score percentiles

Raw total scores \(S_i\) (before utility) collected per option. Report p10, p50, p90.

### 7.7 Factor attribution

Across all iterations, average contribution \(c_{ij}\) per factor. **Winner gap** = winner's average contribution minus runner-up's, per factor.

---

## 8. Weight sensitivity analysis

Separate from main simulation (uses **2,500** iterations per test for speed):

For each factor \(j\), multiply its raw weight by multipliers **0.5, 0.6, …, 1.5** while scaling other weights proportionally to keep the same total. Re-run simulation. Report when the **overall winner changes**.

---

## 9. Alternative methods (deterministic checks)

These use only your **most likely (mode)** estimates, not full uncertainty:

### 9.1 TOPSIS

1. Build matrix of normalized mode values per option × factor
2. Apply normalized weights
3. Ideal best = max per column; ideal worst = min per column
4. Distance to ideal best \(d^+\), distance to ideal worst \(d^-\)
5. Score = \(d^- / (d^+ + d^-)\) — higher is better

### 9.2 Minimax regret

1. Normalize mode values to \([0,1]\) per factor
2. For each factor, find best normalized value across options
3. Regret for option \(i\) on factor \(j\) = best\(_j\) − value\(_{ij}\)
4. **Max regret** for option \(i\) = max over factors
5. Choose option with **lowest** max regret

If Monte Carlo, TOPSIS, and minimax disagree, uncertainty or weights may be driving different conclusions.

---

## 10. Confidence labels & warnings (heuristics)

| Rule | Trigger |
|------|---------|
| High confidence | Win probability > 75% **and** no statistical tie |
| Low confidence | Win probability < 55% **or** statistical tie |
| Weak decision warning | Win probability < 55% |
| High variance warning | Option std dev > 30% of its mean score |
| Regret warning | Expected regret > 50% of winner's mean |
| Bias warning | Any single factor weight > 50% of total |

These are **transparent rules**, not learned thresholds.

---

## 11. Reproducibility (seed)

If a **simulation seed** is set, `Math.random` is replaced with a deterministic PRNG (Mulberry32) for the duration of the run. The seed is shown on results. Tie-breaking and reservoir sampling use the same stream.

Beta draws use jStat's Beta sampler (also fed by patched `Math.random` during the run).

---

## 12. What this model does **not** do

| Limitation | Implication |
|------------|-------------|
| Independent factor sampling | Cannot model "if salary is high, equity is too" unless you use macro scenario |
| Compensatory weighted sum | A terrible commute can be fully offset by salary unless you set a **veto** |
| Your estimates | Garbage in → confident but wrong output |
| No external data | Does not fetch market salaries, COL indices, etc. |
| Heuristic confidence | "High/Medium/Low" is rule-based, not a formal hypothesis test of "option A ≠ option B" |
| 10,000 iterations | Monte Carlo error is small for win % but not zero |

---

## 13. Worked micro-example (2 options, 1 factor)

**Factor:** Salary (weight 100%, higher is better)

| Option | min | mode | max |
|--------|-----|------|-----|
| A | 80k | 100k | 120k |
| B | 70k | 90k | 110k |

Global bounds: 70k–120k.

If one iteration samples A=105k → \(n = (105-70)/50 = 0.7\), contribution = 0.7.  
If B samples 88k → \(n = (88-70)/50 = 0.36\), contribution = 0.36.  
A wins that iteration.

Repeat 10,000 times → A wins ~85% of runs (illustrative). Wilson CI quantifies uncertainty on that 85%.

---

## 14. File reference

| Module | Responsibility |
|--------|----------------|
| `math-engine/index.js` | Main Monte Carlo loop, aggregation |
| `math-engine/rng.js` | Seeded random |
| `math-engine/statistics.js` | Wilson CI, tie detection |
| `math-engine/sensitivity.js` | Weight sweep |
| `math-engine/veto.js` | Must-have rules |
| `math-engine/macroScenarios.js` | Correlated environment shift |
| `math-engine/alternativeMethods.js` | TOPSIS, minimax regret |
| `criterionTypes.js` | Measurement types, simple mode |

---

## 15. Disclaimer

Decision Coach is **decision support software**, not professional advice. The mathematics described here is applied **only to values you enter**. Use results to structure thinking — not as a substitute for judgment, conversation, or expert counsel when stakes are high.

---

*Document version: July 2026 · Matches app schema v3*
