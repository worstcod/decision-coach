import { enrichCriterion } from './criterionTypes';

/** @typedef {'JOB'|'FINANCE'|'LIFE'|'CUSTOM'} DomainId */

export const DOMAINS = {
  JOB: {
    id: 'JOB',
    title: 'Job / Career',
    subtitle: 'Compare jobs, offers, or career paths',
    icon: '💼',
  },
  FINANCE: {
    id: 'FINANCE',
    title: 'Finance',
    subtitle: 'Investments, loans, purchases, savings',
    icon: '💰',
  },
  LIFE: {
    id: 'LIFE',
    title: 'Life',
    subtitle: 'Relocation, lifestyle, major personal choices',
    icon: '🌱',
  },
  CUSTOM: {
    id: 'CUSTOM',
    title: 'Custom',
    subtitle: "I'll pick my own factors from the library",
    icon: '✍️',
  },
};

export const FACTOR_CATALOG = {
  salary: {
    id: 'salary',
    name: 'Salary / Compensation',
    measureType: 'salary',
    isPositive: true,
    defaultWeight: 30,
    why: 'Use when total pay is a main driver of the decision.',
    domains: ['JOB', 'universal'],
  },
  equity: {
    id: 'equity',
    name: 'Equity / Stock Upside',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 20,
    why: 'Use when stock options or ownership could significantly change total reward.',
    domains: ['JOB'],
  },
  commute: {
    id: 'commute',
    name: 'Commute Time',
    measureType: 'minutes',
    isPositive: false,
    defaultWeight: 15,
    why: 'Use when daily travel time affects quality of life.',
    domains: ['JOB'],
  },
  wlb: {
    id: 'wlb',
    name: 'Work-Life Balance',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 20,
    why: 'Use when hours, flexibility, and burnout risk matter.',
    domains: ['JOB', 'universal'],
  },
  growth: {
    id: 'growth',
    name: 'Learning & Growth',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when skill development and career trajectory are important.',
    domains: ['JOB', 'universal'],
  },
  security: {
    id: 'security',
    name: 'Job Security / Stability',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when company stability or role permanence is a concern.',
    domains: ['JOB', 'FINANCE'],
  },
  culture: {
    id: 'culture',
    name: 'Team & Culture Fit',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when people, values, and day-to-day environment matter.',
    domains: ['JOB'],
  },
  remote: {
    id: 'remote',
    name: 'Remote / Location Flexibility',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when WFH policy or location freedom is a deciding factor.',
    domains: ['JOB', 'LIFE'],
  },
  brand: {
    id: 'brand',
    name: 'Resume / Brand Value',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 10,
    why: 'Use when the employer name helps future opportunities.',
    domains: ['JOB'],
  },
  happiness: {
    id: 'happiness',
    name: 'Overall Happiness',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 30,
    why: 'Use when how you feel day-to-day is the top priority.',
    domains: ['LIFE', 'universal'],
  },
  stress: {
    id: 'stress',
    name: 'Stress Level',
    measureType: 'score10',
    isPositive: false,
    defaultWeight: 20,
    why: 'Use when mental load or anxiety differs between options.',
    domains: ['LIFE', 'JOB', 'universal'],
  },
  upfront_cost: {
    id: 'upfront_cost',
    name: 'Upfront Cost',
    measureType: 'dollars',
    isPositive: false,
    defaultWeight: 20,
    why: 'Use when a one-time payment is required to choose an option.',
    domains: ['LIFE', 'FINANCE', 'universal'],
  },
  time_commitment: {
    id: 'time_commitment',
    name: 'Time Commitment',
    measureType: 'hours',
    isPositive: false,
    defaultWeight: 15,
    why: 'Use when ongoing hours per week differ between options.',
    domains: ['LIFE', 'universal'],
  },
  freedom: {
    id: 'freedom',
    name: 'Flexibility / Freedom',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when autonomy and schedule control matter.',
    domains: ['LIFE', 'universal'],
  },
  social: {
    id: 'social',
    name: 'Social Life & Network',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when friends, community, or family proximity matters.',
    domains: ['LIFE'],
  },
  career_opportunity: {
    id: 'career_opportunity',
    name: 'Career Opportunity',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 20,
    why: 'Use when long-term professional upside differs by location or path.',
    domains: ['LIFE', 'JOB'],
  },
  return_rate: {
    id: 'return_rate',
    name: 'Expected Return',
    measureType: 'percent',
    isPositive: true,
    defaultWeight: 30,
    why: 'Use when growth or yield on money is the primary goal.',
    domains: ['FINANCE'],
  },
  downside_risk: {
    id: 'downside_risk',
    name: 'Downside Risk',
    measureType: 'percent',
    isPositive: false,
    defaultWeight: 25,
    why: 'Use when worst-case loss or volatility differs between options.',
    domains: ['FINANCE'],
  },
  fees: {
    id: 'fees',
    name: 'Fees / Costs',
    measureType: 'percent',
    isPositive: false,
    defaultWeight: 15,
    why: 'Use when expense ratio, charges, or friction reduce net gains.',
    domains: ['FINANCE'],
  },
  liquidity: {
    id: 'liquidity',
    name: 'Liquidity / Access to Cash',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when how quickly you can access money matters.',
    domains: ['FINANCE'],
  },
  lockup: {
    id: 'lockup',
    name: 'Lock-up Period',
    measureType: 'years',
    isPositive: false,
    defaultWeight: 10,
    why: 'Use when money is tied up for a fixed duration.',
    domains: ['FINANCE'],
  },
  peace_of_mind: {
    id: 'peace_of_mind',
    name: 'Peace of Mind',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 20,
    why: 'Use when emotional comfort or reduced worry has real value.',
    domains: ['FINANCE', 'universal'],
  },
  monthly_cost: {
    id: 'monthly_cost',
    name: 'Monthly Cost',
    measureType: 'dollars',
    isPositive: false,
    defaultWeight: 25,
    why: 'Use for rent vs buy or recurring payment comparisons.',
    domains: ['FINANCE', 'LIFE'],
  },
  long_term_value: {
    id: 'long_term_value',
    name: 'Long-term Value / Equity',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 20,
    why: 'Use when building assets or net worth over time matters.',
    domains: ['FINANCE', 'LIFE'],
  },
  visa: {
    id: 'visa',
    name: 'Visa / Work Authorization',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 25,
    why: 'Use when sponsorship, visa stability, or relocation paperwork differs.',
    domains: ['JOB', 'LIFE'],
  },
  benefits: {
    id: 'benefits',
    name: 'Benefits Package',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when health insurance, PTO, parental leave, or perks differ materially.',
    domains: ['JOB'],
  },
  col: {
    id: 'col',
    name: 'Cost of Living Fit',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when one option is in a cheaper or more expensive city/country.',
    domains: ['JOB', 'LIFE', 'FINANCE'],
  },
  manager: {
    id: 'manager',
    name: 'Manager / Leadership Quality',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when who you report to will shape your day-to-day experience.',
    domains: ['JOB'],
  },
  pension: {
    id: 'pension',
    name: 'Retirement / Pension Benefit',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when employer match, pension, or long-term savings benefits differ.',
    domains: ['JOB', 'FINANCE'],
  },
  tax_benefit: {
    id: 'tax_benefit',
    name: 'Tax Efficiency',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 10,
    why: 'Use when after-tax outcomes or tax-advantaged structures differ.',
    domains: ['FINANCE', 'JOB'],
  },
  family_proximity: {
    id: 'family_proximity',
    name: 'Family & Support Network',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 20,
    why: 'Use when being near family or a support system matters.',
    domains: ['LIFE'],
  },
  climate: {
    id: 'climate',
    name: 'Climate & Environment',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 10,
    why: 'Use when weather, air quality, or outdoor lifestyle differs.',
    domains: ['LIFE'],
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare Access',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 15,
    why: 'Use when medical care quality or access differs between locations.',
    domains: ['LIFE'],
  },
  side_income: {
    id: 'side_income',
    name: 'Side Income Potential',
    measureType: 'score10',
    isPositive: true,
    defaultWeight: 10,
    why: 'Use when freelancing, consulting, or moonlighting opportunities differ.',
    domains: ['JOB', 'FINANCE'],
  },
};

export const SCENARIOS = {
  JOB: [
    {
      id: 'job_compare_offers',
      title: 'Compare two job offers',
      example: 'e.g. Acme Corp vs Bright Startup',
      optionPlaceholders: ['Company A', 'Company B'],
      factorIds: ['salary', 'commute', 'wlb', 'growth', 'security'],
      estimateHint: 'Enter salary as full yearly USD (90000 = $90k). Rate balance and growth 1–10.',
    },
    {
      id: 'job_startup_vs_stable',
      title: 'Startup vs stable company',
      example: 'e.g. Early startup vs Big Tech',
      optionPlaceholders: ['Startup', 'Established company'],
      factorIds: ['salary', 'equity', 'security', 'wlb', 'growth'],
      estimateHint: 'Startups: wider salary range, higher equity upside, lower stability score.',
    },
    {
      id: 'job_stay_vs_leave',
      title: 'Stay vs leave current job',
      example: 'e.g. Stay put vs take a new offer',
      optionPlaceholders: ['Stay at current job', 'Take new role'],
      factorIds: ['happiness', 'growth', 'salary', 'security', 'stress'],
      estimateHint: 'Compare your current reality against the new opportunity honestly.',
    },
    {
      id: 'job_remote_vs_relocate',
      title: 'Remote vs relocate / office',
      example: 'e.g. Remote role vs moving for on-site job',
      optionPlaceholders: ['Remote option', 'Relocate / office'],
      factorIds: ['salary', 'commute', 'remote', 'wlb', 'social'],
      estimateHint: 'Factor in cost-of-living differences if relocating.',
    },
    {
      id: 'job_international',
      title: 'International job offer',
      example: 'e.g. Stay home vs relocate abroad for work',
      optionPlaceholders: ['Stay', 'Move abroad'],
      factorIds: ['salary', 'visa', 'col', 'family_proximity', 'career_opportunity'],
      estimateHint: 'Factor visa sponsorship and cost-of-living — use your preferred currency on the estimates step.',
    },
    {
      id: 'job_freelance_vs_fulltime',
      title: 'Freelance vs full-time',
      example: 'e.g. Contract work vs permanent employment',
      optionPlaceholders: ['Freelance', 'Full-time'],
      factorIds: ['salary', 'freedom', 'security', 'benefits', 'side_income'],
      estimateHint: 'Include irregular income ranges for freelance; rate stability and benefits for full-time.',
    },
  ],
  FINANCE: [
    {
      id: 'finance_investments',
      title: 'Compare investments',
      example: 'e.g. Index fund vs individual stocks',
      optionPlaceholders: ['Option A', 'Option B'],
      factorIds: ['return_rate', 'downside_risk', 'fees', 'liquidity', 'lockup'],
      estimateHint: 'Return and risk as percentages. Liquidity on a 1–10 scale.',
    },
    {
      id: 'finance_debt_vs_invest',
      title: 'Pay debt vs invest',
      example: 'e.g. Pay off loan early vs invest surplus',
      optionPlaceholders: ['Pay down debt', 'Invest instead'],
      factorIds: ['return_rate', 'peace_of_mind', 'liquidity', 'downside_risk', 'fees'],
      estimateHint: 'Debt payoff return = interest rate saved. Peace of mind is subjective 1–10.',
    },
    {
      id: 'finance_rent_vs_buy',
      title: 'Rent vs buy',
      example: 'e.g. Keep renting vs purchase a home',
      optionPlaceholders: ['Keep renting', 'Buy property'],
      factorIds: ['monthly_cost', 'upfront_cost', 'freedom', 'long_term_value', 'stress'],
      estimateHint: 'Include deposit/down payment in upfront cost for buying.',
    },
    {
      id: 'finance_major_purchase',
      title: 'Major purchase decision',
      example: 'e.g. New car vs keep current car',
      optionPlaceholders: ['Option A', 'Option B'],
      factorIds: ['upfront_cost', 'monthly_cost', 'long_term_value', 'stress', 'freedom'],
      estimateHint: 'Include maintenance and insurance in ongoing costs.',
    },
    {
      id: 'finance_retire_early',
      title: 'Early retirement / FIRE path',
      example: 'e.g. Aggressive saving vs balanced lifestyle now',
      optionPlaceholders: ['Save aggressively', 'Balanced path'],
      factorIds: ['return_rate', 'monthly_cost', 'happiness', 'liquidity', 'peace_of_mind'],
      estimateHint: 'Balance future freedom against present quality of life.',
    },
  ],
  LIFE: [
    {
      id: 'life_relocate',
      title: 'Move to new city or country',
      example: 'e.g. Stay in Mumbai vs move to Berlin',
      optionPlaceholders: ['Stay', 'Move'],
      factorIds: ['happiness', 'upfront_cost', 'career_opportunity', 'social', 'stress'],
      estimateHint: 'Upfront cost includes moving, deposits, and setup expenses.',
    },
    {
      id: 'life_lifestyle',
      title: 'Lifestyle or living situation',
      example: 'e.g. Live alone vs with roommates vs family',
      optionPlaceholders: ['Option A', 'Option B'],
      factorIds: ['happiness', 'stress', 'monthly_cost', 'freedom', 'social'],
      estimateHint: 'Rate happiness and stress honestly for each living arrangement.',
    },
    {
      id: 'life_health_change',
      title: 'Health or lifestyle change',
      example: 'e.g. Start fitness plan vs status quo',
      optionPlaceholders: ['Make the change', 'Stay as is'],
      factorIds: ['happiness', 'stress', 'time_commitment', 'upfront_cost', 'long_term_value'],
      estimateHint: 'Time commitment = hours per week. Long-term value = health impact 1–10.',
    },
    {
      id: 'life_education',
      title: 'Education or upskilling',
      example: 'e.g. MBA vs online certification vs self-study',
      optionPlaceholders: ['Path A', 'Path B'],
      factorIds: ['upfront_cost', 'time_commitment', 'career_opportunity', 'happiness', 'stress'],
      estimateHint: 'Include opportunity cost of time away from work if relevant.',
    },
    {
      id: 'life_family_move',
      title: 'Move closer to family',
      example: 'e.g. Stay in current city vs move near parents',
      optionPlaceholders: ['Stay', 'Move near family'],
      factorIds: ['family_proximity', 'happiness', 'career_opportunity', 'col', 'social'],
      estimateHint: 'Weigh emotional support against career and cost-of-living trade-offs.',
    },
    {
      id: 'life_climate_relocate',
      title: 'Relocate for climate / lifestyle',
      example: 'e.g. Stay in current climate vs move for sun/mountains/coast',
      optionPlaceholders: ['Current place', 'New place'],
      factorIds: ['climate', 'happiness', 'upfront_cost', 'healthcare', 'social'],
      estimateHint: 'Rate climate and outdoor lifestyle honestly — include moving costs upfront.',
    },
  ],
};

export function getFactorById(factorId) {
  return FACTOR_CATALOG[factorId] || null;
}

export function getScenariosForDomain(domainId) {
  if (domainId === 'CUSTOM') return [];
  return SCENARIOS[domainId] || [];
}

export function getScenario(domainId, scenarioId) {
  return getScenariosForDomain(domainId).find(s => s.id === scenarioId) || null;
}

export function getFactorsForDomain(domainId) {
  return Object.values(FACTOR_CATALOG).filter(
    f => f.domains.includes(domainId) || f.domains.includes('universal')
  );
}

export function getLibraryFactorsGrouped() {
  const groups = [
    { label: 'Universal', domainId: 'universal', factors: [] },
    { label: 'Job / Career', domainId: 'JOB', factors: [] },
    { label: 'Finance', domainId: 'FINANCE', factors: [] },
    { label: 'Life', domainId: 'LIFE', factors: [] },
  ];
  Object.values(FACTOR_CATALOG).forEach(f => {
    if (f.domains.includes('universal')) groups[0].factors.push(f);
    if (f.domains.includes('JOB')) groups[1].factors.push(f);
    if (f.domains.includes('FINANCE')) groups[2].factors.push(f);
    if (f.domains.includes('LIFE')) groups[3].factors.push(f);
  });
  return groups.filter(g => g.factors.length > 0);
}

export function catalogFactorToCriterion(factor, existingWeight) {
  return enrichCriterion({
    id: `c_${factor.id}`,
    catalogId: factor.id,
    name: factor.name,
    measureType: factor.measureType,
    isPositive: factor.isPositive,
    weight: existingWeight ?? factor.defaultWeight,
    why: factor.why,
  });
}

export function buildCriteriaFromFactorIds(factorIds, existingCriteria = []) {
  const existingByCatalog = Object.fromEntries(
    existingCriteria.filter(c => c.catalogId).map(c => [c.catalogId, c])
  );
  return factorIds.map(fid => {
    const factor = getFactorById(fid);
    if (!factor) return null;
    const prev = existingByCatalog[fid];
    return catalogFactorToCriterion(factor, prev?.weight);
  }).filter(Boolean);
}

export function buildCriteriaFromScenario(domainId, scenarioId, existingCriteria = []) {
  const scenario = getScenario(domainId, scenarioId);
  if (!scenario) return [];
  return buildCriteriaFromFactorIds(scenario.factorIds, existingCriteria);
}

export function getScenarioContext(domainId, scenarioId) {
  if (domainId === 'CUSTOM') {
    return {
      title: 'Custom decision',
      example: 'Pick factors that matter to you from the library below.',
      estimateHint: 'Enter estimates using the units shown on each factor card.',
      optionPlaceholders: ['Option A', 'Option B'],
    };
  }
  const scenario = getScenario(domainId, scenarioId);
  const domain = DOMAINS[domainId];
  return {
    title: scenario?.title || domain?.title,
    example: scenario?.example || '',
    estimateHint: scenario?.estimateHint || '',
    optionPlaceholders: scenario?.optionPlaceholders || ['Option A', 'Option B'],
  };
}

export function getProgressStep(step, domainId) {
  if (step <= 0) return 0;
  if (domainId === 'CUSTOM' && step >= 3) return step - 1;
  return Math.min(step, 6);
}
