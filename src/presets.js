export const PRESETS = {
  JOB: {
    id: 'job',
    title: 'Job / Career Decision',
    description: 'Evaluate offers based on salary, commute, and work-life balance.',
    icon: '💼',
    criteria: [
      { id: 'c1', name: 'Salary / Comp', weight: 35, isPositive: true, unit: '$' },
      { id: 'c2', name: 'Commute Time', weight: 20, isPositive: false, unit: 'mins' },
      { id: 'c3', name: 'Learning & Growth', weight: 15, isPositive: true, unit: '/10' },
      { id: 'c4', name: 'Work-Life Balance', weight: 15, isPositive: true, unit: '/10' },
      { id: 'c5', name: 'Job Security', weight: 15, isPositive: true, unit: '/10' }
    ]
  },
  FINANCE: {
    id: 'finance',
    title: 'Financial Decision',
    description: 'Assess investments based on return, risk, and timeline.',
    icon: '💰',
    criteria: [
      { id: 'c1', name: 'Expected Return', weight: 35, isPositive: true, unit: '%' },
      { id: 'c2', name: 'Risk (Downside)', weight: 30, isPositive: false, unit: '%' },
      { id: 'c3', name: 'Fees / Costs', weight: 15, isPositive: false, unit: '%' },
      { id: 'c4', name: 'Lock-up Period', weight: 10, isPositive: false, unit: 'yrs' },
      { id: 'c5', name: 'Liquidity Ease', weight: 10, isPositive: true, unit: '/10' }
    ]
  },
  LIFE: {
    id: 'life',
    title: 'Life Decision',
    description: 'Navigate major life choices considering happiness, cost, and stress.',
    icon: '🌱',
    criteria: [
      { id: 'c1', name: 'Overall Happiness', weight: 35, isPositive: true, unit: '/10' },
      { id: 'c2', name: 'Stress Levels', weight: 25, isPositive: false, unit: '/10' },
      { id: 'c3', name: 'Upfront Cost', weight: 15, isPositive: false, unit: '$' },
      { id: 'c4', name: 'Time Commitment', weight: 15, isPositive: false, unit: 'hrs' },
      { id: 'c5', name: 'Flexibility / Freedom', weight: 10, isPositive: true, unit: '/10' }
    ]
  },
  CUSTOM: {
    id: 'custom',
    title: 'Custom Decision',
    description: 'Start from scratch and define your own options and criteria.',
    icon: '✍️',
    criteria: [
      { id: 'c1', name: 'Criterion 1', weight: 50, isPositive: true, unit: '/100' },
      { id: 'c2', name: 'Criterion 2', weight: 50, isPositive: true, unit: '/100' }
    ]
  }
};
