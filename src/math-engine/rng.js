/** Mulberry32 seeded PRNG — deterministic when seed is set. */
export function createRng(seed) {
  if (seed == null) {
    return () => Math.random();
  }
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 2147483647);
}
