// Mock Pearson correlation matrices between crime categories and indicators for Module 10
export const CRIME_CORRELATION_MATRIX = {
  population: { 'Property Theft': 0.72, 'Assault': 0.45, 'Cybercrime': 0.81, 'Fraud': 0.65 },
  literacyRate: { 'Property Theft': -0.32, 'Assault': -0.58, 'Cybercrime': 0.48, 'Fraud': 0.35 },
  employmentRate: { 'Property Theft': -0.45, 'Assault': -0.25, 'Cybercrime': 0.15, 'Fraud': -0.12 },
  averageIncome: { 'Property Theft': 0.52, 'Assault': 0.11, 'Cybercrime': 0.76, 'Fraud': 0.68 },
  urbanization: { 'Property Theft': 0.78, 'Assault': 0.38, 'Cybercrime': 0.89, 'Fraud': 0.72 }
};

export const CORRELATION_INDICATORS = [
  { id: 'population', name: 'Population', label: 'Population' },
  { id: 'literacyRate', name: 'Literacy Rate', label: 'Literacy Rate (%)' },
  { id: 'employmentRate', name: 'Employment Rate', label: 'Employment Rate (%)' },
  { id: 'averageIncome', name: 'Average Income', label: 'Average Income (INR)' },
  { id: 'urbanization', name: 'Urbanization', label: 'Urbanization (%)' }
];

export const CORRELATION_CATEGORIES = [
  'Property Theft',
  'Assault',
  'Cybercrime',
  'Fraud'
];
