import { DISTRICTS, POLICE_STATIONS, CATEGORIES, STATUSES } from '../../../api/constants';

export { DISTRICTS, POLICE_STATIONS, CATEGORIES, STATUSES };

const generateMockCases = () => {
  const list = [];
  const baseDate = new Date(2026, 6, 23);
  const randomDateBefore = (daysAgo) => {
    const d = new Date(baseDate.getTime());
    d.setDate(baseDate.getDate() - Math.floor(Math.random() * daysAgo));
    d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    return d;
  };

  for (let i = 1; i <= 125; i++) {
    const district = DISTRICTS[i % DISTRICTS.length];
    const stations = POLICE_STATIONS[district];
    const station = stations[i % stations.length];
    const category = CATEGORIES[i % CATEGORIES.length];
    const risks = ['Critical', 'High', 'Medium', 'Low'];
    let status = STATUSES[i % STATUSES.length];
    let risk = risks[i % risks.length];
    if (category === 'Violent Crime' && risk === 'Low') risk = 'Critical';
    if (category === 'Cybercrime' && risk === 'Low') risk = 'Medium';
    if (status === 'Closed') risk = 'Low';
    const firYear = i % 2 === 0 ? '2026' : '2025';
    const caseId = `FIR-${firYear}-${1000 + i}`;
    let caseDate;
    if (i <= 12) caseDate = randomDateBefore(1);
    else if (i <= 35) caseDate = randomDateBefore(7);
    else if (i <= 80) caseDate = randomDateBefore(30);
    else if (i <= 110) caseDate = randomDateBefore(90);
    else caseDate = randomDateBefore(365);

    list.push({
      id: caseId,
      category,
      district,
      policeStation: station,
      date: caseDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      rawDate: caseDate,
      risk,
      status,
      arrests: (status === 'Closed' || risk === 'Low') ? 1 : (risk === 'Critical' || risk === 'High') ? Math.floor(Math.random() * 3) : 0,
      details: {
        officer: `Inspector ${['Rao', 'Patil', 'Gowda', 'Kumar', 'Naik', 'Reddy', 'Desai'][i % 7]}`,
        section: `Section ${[302, 379, 420, 354, 21, '66D IT Act'][i % 6]} IPC`,
        summary: `Incident logged under ${category} at ${station}, ${district}.`,
        timeline: [
          { date: caseDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) + ' - FIR Registered', desc: 'Case logged in CCTNS' },
        ]
      }
    });
  }
  return list;
};

export const MOCK_CASES = generateMockCases();

export const MOCK_ALERTS = [
  { type: 'critical', title: 'Cybercrime Surge', desc: 'Phishing cases spiked 35% in Bengaluru City during last 48 hours.', district: 'Bengaluru City', category: 'Cybercrime', time: '10m ago' },
  { type: 'warning', title: 'Property Theft Alert', desc: 'Unusual nighttime burglary pattern spotted in Saraswathipuram, Mysuru.', district: 'Mysuru', category: 'Property Theft', time: '45m ago' },
  { type: 'critical', title: 'Narcotics Syndicate Node', desc: 'Syndicate transport route flagged near Hubballi-Dharwad highway checkpost.', district: 'Hubballi-Dharwad', category: 'Narcotics', time: '2h ago' },
  { type: 'info', title: 'Data Reconciliation Complete', desc: 'Weekly CCTNS databases synced.', district: 'All', category: 'All', time: '4h ago' },
  { type: 'warning', title: 'Repeat Offender Alert', desc: 'Known financial fraud offender spotted near bank cluster in Mangaluru.', district: 'Mangaluru City', category: 'Financial Fraud', time: '6h ago' },
];
