# Decision Coach – Quick Overview

## What does the app do?
Decision Coach helps you choose between several options (e.g., two job offers, two investment ideas) by turning **qualitative factors** – like salary, risk, or happiness – into numbers and then running a **Monte Carlo simulation**. The simulation explores thousands of possible futures and tells you which option has the highest chance of success.

---

## How the math works – in plain English

1. **Define the factors**
   * For each factor you decide whether a *higher* number is **good** (e.g., Salary) or **bad** (e.g., Commute Time).  
   * You also assign a **weight** that says how important that factor is compared to the others.

2. **Give three estimates per factor** (per option)
   * **Worst‑case** – the lowest realistic value you could see.
   * **Likely (mode)** – the value you most expect to happen.
   * **Best‑case** – the highest realistic value.
   * These three numbers describe a **triangular distribution** – a simple way to model uncertainty.

3. **Monte Carlo simulation**
   * The engine repeats the following **2000 times** (or any number you set):
     1. For every factor of every option it **randomly picks a value** from the triangular distribution you supplied.  
     2. If the factor is marked *"Lower is better"* the engine **flips the value** so that low numbers become high scores.
     3. The sampled value is multiplied by the factor’s **normalized weight** (weight ÷ total weight) and added to an overall **score** for that option.
   * After each iteration we have a **score** for each option.
   * At the end we count how many times each option got the highest score – that ratio is the **Win Probability** shown to the user.

4. **Risk profile (optional)**
   * The simulation can apply a simple **utility function** based on your risk tolerance (risk‑averse, neutral, risk‑seeking).  
   * This changes how the scores are aggregated – for example, a risk‑averse profile penalises options with very bad worst‑case draws.

---

## Why this matters
* By using a **range** instead of a single number you capture the natural uncertainty of real life.
* The **Monte Carlo** approach evaluates thousands of "possible worlds" quickly, giving you a statistically‑sound recommendation rather than a gut feeling.
* The **weights** ensure that more important factors (e.g., Salary) influence the result more than less‑important ones (e.g., Commute).

---

## Quick cheat‑sheet
| Step | What you provide | How it is used |
|------|------------------|----------------|
| 1️⃣ Factors | Name, weight, isPositive, unit | Determines importance and direction of scores |
| 2️⃣ Estimates | Worst / Likely / Best per option‑factor | Builds a triangular distribution for random sampling |
| 3️⃣ Run | Click *Analyze Decision* | Executes 2000 Monte Carlo draws, calculates win probabilities |
| 4️⃣ Optional | Risk profile selection | Adjusts utility function for risk‑averse or risk‑seeking behavior |

---

## Technical notes (for developers)
* **Triangular sampling** is performed by `sampleTriangular(min, mode, max)`.
* **Normalization** of weights happens once per run: `normWeight = weight / totalWeight`.
* **Negative‑direction factors** are handled by computing the maximum possible value for that factor and using `maxValue - sample` to flip the score.
* Results are stored as an object with `scores`, `winProbability`, and the winning option ID.

---

Feel free to dive into `src/math-engine/index.js` for the exact implementation – it’s a handful of pure JavaScript functions that keep the whole app client‑side and fast.
