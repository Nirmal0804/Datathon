// Karnataka Police Analytics Suite - Mock Data Store
// Simulates database values for Module 5 (Crime Trend Analysis & Alerts).

export const SUMMARY_CARDS_DATA = {
  'Today': {
    growth: { val: '+1.2%', trend: 'up', spark: [20, 25, 23, 28, 30, 27, 32] },
    increase: { val: 'Cyber (+5%)', trend: 'up', spark: [10, 12, 11, 14, 18, 15, 20] },
    decrease: { val: 'Fraud (-4%)', trend: 'down', spark: [30, 28, 26, 27, 24, 22, 20] },
    alerts: { val: '4 active', trend: 'up', spark: [2, 3, 2, 4, 3, 5, 4] }
  },
  'This Week': {
    growth: { val: '+2.8%', trend: 'up', spark: [120, 128, 122, 135, 131, 140, 145] },
    increase: { val: 'Vehicle Theft (+12%)', trend: 'up', spark: [80, 85, 90, 88, 92, 98, 100] },
    decrease: { val: 'Narcotics (-8%)', trend: 'down', spark: [50, 48, 44, 46, 42, 40, 38] },
    alerts: { val: '18 active', trend: 'up', spark: [12, 15, 14, 16, 15, 19, 18] }
  },
  'This Month': {
    growth: { val: '+5.8%', trend: 'up', spark: [510, 525, 540, 530, 560, 580, 595] },
    increase: { val: 'Vehicle Theft (+18%)', trend: 'up', spark: [180, 190, 210, 200, 220, 230, 245] },
    decrease: { val: 'Cybercrime (-12%)', trend: 'down', spark: [140, 135, 130, 125, 118, 112, 105] },
    alerts: { val: '45 active', trend: 'up', spark: [38, 41, 40, 43, 42, 47, 45] }
  },
  'This Year': {
    growth: { val: '+12.4%', trend: 'up', spark: [6200, 6400, 6500, 6800, 7100, 7400, 7800] },
    increase: { val: 'Armed Robbery (+22%)', trend: 'up', spark: [2100, 2200, 2350, 2400, 2600, 2750, 2900] },
    decrease: { val: 'Property Theft (-15%)', trend: 'down', spark: [3400, 3300, 3100, 2900, 2800, 2650, 2500] },
    alerts: { val: '210 active', trend: 'up', spark: [180, 195, 190, 205, 200, 215, 210] }
  },
  'Custom Range': {
    growth: { val: '+4.1%', trend: 'up', spark: [310, 320, 315, 330, 345, 340, 360] },
    increase: { val: 'Cyber (+14%)', trend: 'up', spark: [110, 115, 122, 128, 135, 130, 140] },
    decrease: { val: 'Narcotics (-10%)', trend: 'down', spark: [90, 85, 80, 78, 75, 72, 68] },
    alerts: { val: '28 active', trend: 'up', spark: [22, 25, 24, 27, 26, 29, 28] }
  }
};

export const TRENDS_CHART_DATA = {
  Daily: {
    labels: ['Day 5', 'Day 10', 'Day 15', 'Day 20', 'Day 25', 'Day 30'],
    values: [42, 50, 48, 55, 62, 59],
    maxVal: 80
  },
  Monthly: {
    labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    values: [120, 135, 150, 142, 168, 155, 162, 180, 175, 190, 198, 210],
    maxVal: 250
  },
  Yearly: {
    labels: ['2022', '2023', '2024', '2025', '2026'],
    values: [1420, 1580, 1810, 1950, 2180],
    maxVal: 2500
  },
  Seasonal: {
    labels: ['Summer', 'Monsoon', 'Festival', 'Winter'],
    values: [280, 310, 450, 240],
    maxVal: 500
  }
};

export const ALERTS_DATA = [
  {
    id: 1,
    severity: 'Critical',
    crimeType: 'Vehicle Theft',
    district: 'Bengaluru City',
    timestamp: '10 mins ago',
    recommendation: 'Deploy immediate vehicle checkposts at entry/exit tolls and mobilize interceptors.',
    text: 'Vehicle theft increased by 18% compared to last month.'
  },
  {
    id: 2,
    severity: 'High',
    crimeType: 'Cybercrime',
    district: 'Mysuru District',
    timestamp: '2 hours ago',
    recommendation: 'Issue cyber protection advice letters to commercial banks and run Skimmer scan sweeps.',
    text: 'Cybercrime incidents decreased by 12% following precinct technical overrides.'
  },
  {
    id: 3,
    severity: 'High',
    crimeType: 'Burglary',
    district: 'Hassan',
    timestamp: '5 hours ago',
    recommendation: 'Establish static double-officer foot patrols near jewelry and retail market strips.',
    text: 'Burglary emerging rapidly in Hassan center zones.'
  },
  {
    id: 4,
    severity: 'Medium',
    crimeType: 'Violent Assault',
    district: 'Hubballi-Dharwad',
    timestamp: '12 hours ago',
    recommendation: 'Deploy additional patrols at central transit squares and monitor public crowd counts.',
    text: 'Assault cluster detected near City Bus Stand corridors.'
  }
];

export const HOTSPOTS_DATA = {
  Daily: [
    { area: 'Mysuru North', rate: 18, count: 5, station: 'V V Puram PS' },
    { area: 'Belagavi City', rate: 15, count: 4, station: 'Market PS' },
    { area: 'Hassan District', rate: 11, count: 3, station: 'Hassan Rural PS' }
  ],
  Monthly: [
    { area: 'Mysuru North', rate: 24, count: 28, station: 'V V Puram PS' },
    { area: 'Belagavi City', rate: 19, count: 22, station: 'Market PS' },
    { area: 'Hassan District', rate: 15, count: 18, station: 'Hassan Rural PS' }
  ],
  Yearly: [
    { area: 'Mysuru North', rate: 35, count: 180, station: 'V V Puram PS' },
    { area: 'Belagavi City', rate: 28, count: 145, station: 'Market PS' },
    { area: 'Hassan District', rate: 22, count: 110, station: 'Hassan Rural PS' }
  ]
};

export const FORECAST_DATA = {
  'Next 7 Days': {
    labels: ['Day +1', 'Day +2', 'Day +3', 'Day +4', 'Day +5', 'Day +6', 'Day +7'],
    historical: [45, 48, 50, 47, 52, 55, 53],
    predicted: [54, 56, 59, 61, 63, 62, 65],
    confidence: 96,
    maxVal: 80
  },
  'Next 30 Days': {
    labels: ['Week +1', 'Week +2', 'Week +3', 'Week +4'],
    historical: [180, 190, 198, 205],
    predicted: [210, 222, 230, 245],
    confidence: 94,
    maxVal: 300
  },
  'Next 90 Days': {
    labels: ['Month +1', 'Month +2', 'Month +3'],
    historical: [580, 610, 640],
    predicted: [680, 710, 760],
    confidence: 89,
    maxVal: 900
  }
};
