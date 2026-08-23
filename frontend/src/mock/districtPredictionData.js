// AI Predictive Risk dataset mapping districtId to forecasted indicators.
// Easily replaceable with REST API payload responses.

export const DISTRICT_PREDICTION_DATA = {
  'bengaluru': {
    districtId: 'bengaluru',
    districtName: 'Bengaluru City',
    riskScore: 84,
    riskLevel: 'Critical',
    growth: '+12%',
    confidence: 92,
    factors: {
      frequency: { label: 'Historical Crime Frequency', value: 'High' },
      growthRate: { label: 'Crime Growth Rate', value: 'High' },
      intensity: { label: 'Hotspot Intensity', value: 'High' },
      offender: { label: 'Repeat Offender Activity', value: 'High' },
      seasonal: { label: 'Seasonal Crime Patterns', value: 'Medium' }
    },
    predictedIncrease: [
      { category: 'Property Theft', change: '+18%', isUp: true },
      { category: 'Cyber Fraud', change: '+11%', isUp: true },
      { category: 'Vehicle Theft', change: '+8%', isUp: true },
      { category: 'Violent Crime', change: '+5%', isUp: true }
    ],
    hotspots: ['Indiranagar', 'Koramangala', 'VV Puram', 'Hebbal', 'Yelahanka'],
    recommendations: [
      'Increase night patrol frequency in Koramangala & Indiranagar.',
      'Deploy additional officers in tech park hotspot zones.',
      'Monitor repeat offenders under surveillance rosters.',
      'Strengthen cyber surveillance at central bank divisions.'
    ]
  },
  'mysuru': {
    districtId: 'mysuru',
    districtName: 'Mysuru',
    riskScore: 72,
    riskLevel: 'High',
    growth: '+8%',
    confidence: 89,
    factors: {
      frequency: { label: 'Historical Crime Frequency', value: 'Medium' },
      growthRate: { label: 'Crime Growth Rate', value: 'High' },
      intensity: { label: 'Hotspot Intensity', value: 'Medium' },
      offender: { label: 'Repeat Offender Activity', value: 'Medium' },
      seasonal: { label: 'Seasonal Crime Patterns', value: 'High' }
    },
    predictedIncrease: [
      { category: 'Property Theft', change: '+12%', isUp: true },
      { category: 'Cyber Fraud', change: '+6%', isUp: true },
      { category: 'Vehicle Theft', change: '+4%', isUp: true }
    ],
    hotspots: ['Devaraja Mohalla', 'Gokulam', 'Vidyaranyapuram'],
    recommendations: [
      'Strengthen cyber surveillance near local commercial hubs.',
      'Increase vehicle checkpoints at district entry routes.',
      'Establish foot patrols near central marketplace zones.'
    ]
  },
  'hubballi_dharwad': {
    districtId: 'hubballi_dharwad',
    districtName: 'Hubballi-Dharwad',
    riskScore: 54,
    riskLevel: 'Medium',
    growth: '+4%',
    confidence: 85,
    factors: {
      frequency: { label: 'Historical Crime Frequency', value: 'Low' },
      growthRate: { label: 'Crime Growth Rate', value: 'Medium' },
      intensity: { label: 'Hotspot Intensity', value: 'Medium' },
      offender: { label: 'Repeat Offender Activity', value: 'Low' },
      seasonal: { label: 'Seasonal Crime Patterns', value: 'Medium' }
    },
    predictedIncrease: [
      { category: 'Property Theft', change: '+6%', isUp: true },
      { category: 'Vehicle Theft', change: '+3%', isUp: true }
    ],
    hotspots: ['Gokul Road', 'Vidyanagar', 'Keshwapur'],
    recommendations: [
      'Deploy additional officers in central transit sectors.',
      'Conduct regular verification checks on repeat offenders.',
      'Install additional street camera feeds at key intersections.'
    ]
  }
};
