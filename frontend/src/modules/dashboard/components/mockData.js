// Karnataka Police Crime Intelligence Dashboard - Mock Data Store
// Simulates expected API contracts under Section 11 of the specification.

export const DISTRICTS = [
  'Bengaluru City', 'Mysuru', 'Hubballi-Dharwad', 'Mangaluru City', 'Belagavi',
  'Kalaburagi', 'Davanagere', 'Ballari', 'Tumakuru', 'Udupi',
  'Shivamogga', 'Mandya', 'Bidar', 'Hassan', 'Vijayapura',
  'Bagalkote', 'Chamarajanagar', 'Chikmagalur', 'Chitradurga', 'Dakshina Kannada',
  'Gadag', 'Haveri', 'Kodagu', 'Kolar', 'Koppal',
  'Raichur', 'Ramanagara', 'Uttara Kannada', 'Yadgir', 'Chikkaballapura', 'Bengaluru Rural'
];

export const POLICE_STATIONS = {
  'Bengaluru City': ['Cubbon Park PS', 'Indiranagar PS', 'Koramangala PS', 'Whitefield PS', 'Jayanagar PS'],
  'Mysuru': ['Devaraja PS', 'Lashkar PS', 'Saraswathipuram PS', 'Vidyaranyapuram PS'],
  'Hubballi-Dharwad': ['Suburban PS', 'Town PS', 'Gokul Road PS', 'Vidyanagar PS'],
  'Mangaluru City': ['Barke PS', 'Kadri PS', 'Pandeshwar PS', 'Ullal PS'],
  'Belagavi': ['Khade Bazar PS', 'Market PS', 'Shahapur PS', 'Udyambag PS'],
  'Kalaburagi': ['Station Bazar PS', 'Chowk PS', 'Raghavendra Nagar PS'],
  'Davanagere': ['Extension PS', 'Gandhinagar PS', 'KTJ Nagar PS'],
  'Ballari': ['Brucepet PS', 'Cowlobazaar PS', 'Gandhinagar PS'],
  'Tumakuru': ['Town PS', 'Kyathasandra PS', 'New Extension PS'],
  'Udupi': ['Town PS', 'Manipal PS', 'Malpe PS'],
};

// Fill in default stations for any district not explicitly mapped above
DISTRICTS.forEach(d => {
  if (!POLICE_STATIONS[d]) {
    POLICE_STATIONS[d] = [`${d} Town PS`, `${d} Rural PS`, `${d} Traffic PS`];
  }
});

export const CATEGORIES = [
  'Cybercrime',
  'Property Theft',
  'Violent Crime',
  'Financial Fraud',
  'Narcotics',
  'Crime Against Women'
];

export const STATUSES = [
  'Active',
  'Investigating',
  'Closed',
  'Under Review'
];

// Generate 120 mock cases spanning last 12 months
const generateMockCases = () => {
  const list = [];
  const categoriesList = CATEGORIES;
  const statusList = STATUSES;
  const risks = ['Critical', 'High', 'Medium', 'Low'];
  
  // Set date ranges relative to July 2026
  const baseDate = new Date(2026, 6, 23); // July 23, 2026

  // Helper to generate a random date in the last N days
  const randomDateBefore = (daysAgo) => {
    const d = new Date(baseDate.getTime());
    d.setDate(baseDate.getDate() - Math.floor(Math.random() * daysAgo));
    // randomize hour/min
    d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);
    return d;
  };

  // Add 120 structured cases
  for (let i = 1; i <= 125; i++) {
    const district = DISTRICTS[i % DISTRICTS.length];
    const stations = POLICE_STATIONS[district];
    const station = stations[i % stations.length];
    const category = categoriesList[i % categoriesList.length];
    
    let status = statusList[i % statusList.length];
    let risk = risks[i % risks.length];

    // Align statuses and risks realistically
    if (category === 'Violent Crime' && risk === 'Low') risk = 'Critical';
    if (category === 'Cybercrime' && risk === 'Low') risk = 'Medium';
    if (status === 'Closed') risk = 'Low';

    const firYear = i % 2 === 0 ? '2026' : '2025';
    const caseId = `FIR-${firYear}-${1000 + i}`;
    
    // Distribute cases over time: 15 in last day, 30 in last week, 60 in last month, and rest over the last year
    let caseDate;
    if (i <= 12) {
      caseDate = randomDateBefore(1); // 24h
    } else if (i <= 35) {
      caseDate = randomDateBefore(7); // 7 days
    } else if (i <= 80) {
      caseDate = randomDateBefore(30); // 30 days
    } else if (i <= 110) {
      caseDate = randomDateBefore(90); // 90 days (quarter)
    } else {
      caseDate = randomDateBefore(365); // 1 year
    }

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
        summary: `Incident logged under ${category} at ${station}, ${district}. Initial FIR registered and assigned to investigator. ${
          category === 'Cybercrime' ? 'Investigation involves tracing suspect IP addresses and digital wallet transactions.' :
          category === 'Property Theft' ? 'Stolen items list compiled. Local pawn shops and surveillance video checked.' :
          category === 'Violent Crime' ? 'Crime scene secured. Forensic team collected physical evidence and fingerprints.' :
          'Witness statements recorded and suspects listed for questioning.'
        }`,
        timeline: [
          { date: new Date(caseDate.getTime() - 2 * 3600000).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) + ' - Incident Occurred', desc: 'Reported by local witness' },
          { date: caseDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}) + ' - FIR Registered', desc: 'Case officially logged in Karnataka Police CCTNS system' },
          status !== 'Active' ? { date: 'Next Day - Assigned', desc: 'Case delegated to investigating officer' } : null,
          status === 'Closed' ? { date: 'Resolved', desc: 'Final charge sheet submitted to court. Case closed.' } : null,
        ].filter(Boolean)
      }
    });
  }

  return list;
};

export const MOCK_CASES = generateMockCases();

// Raw System Alerts
export const MOCK_ALERTS = [
  { type: 'critical', title: 'Cybercrime Surge', desc: 'Phishing cases spiked 35% in Bengaluru City during last 48 hours.', district: 'Bengaluru City', category: 'Cybercrime', time: '10m ago' },
  { type: 'warning', title: 'Property Theft Alert', desc: 'Unusual nighttime burglary pattern spotted in Saraswathipuram, Mysuru.', district: 'Mysuru', category: 'Property Theft', time: '45m ago' },
  { type: 'critical', title: 'Narcotics Syndicate Node', desc: 'Syndicate transport route flagged near Hubballi-Dharwad highway checkpost.', district: 'Hubballi-Dharwad', category: 'Narcotics', time: '2h ago' },
  { type: 'info', title: 'Data Reconciliation Complete', desc: 'Weekly Crime & Criminal Tracking Network Systems (CCTNS) databases synced.', district: 'All', category: 'All', time: '4h ago' },
  { type: 'warning', title: 'Repeat Offender Alert', desc: 'Known financial fraud offender spotted near bank cluster in Mangaluru.', district: 'Mangaluru City', category: 'Financial Fraud', time: '6h ago' },
  { type: 'info', title: 'Forensic System Update', desc: 'Karnataka State Forensic Laboratory automated ballistics database upgraded.', district: 'All', category: 'All', time: '1d ago' },
  { type: 'critical', title: 'Violent Crime Escalation', desc: 'Syndicate clash reported in Belagavi District. Security patrols reinforced.', district: 'Belagavi', category: 'Violent Crime', time: '1d ago' },
];

// Helper to filter raw cases based on filter options
const getFilteredCases = (filters) => {
  let result = [...MOCK_CASES];
  const { dateRange, district, policeStation, category, status } = filters;

  // 1. Date Range Filter
  const now = new Date(2026, 6, 23);
  if (dateRange && dateRange !== 'Yearly') {
    let cutoffDays = 30; // default Monthly
    if (dateRange === 'Daily') cutoffDays = 1;
    else if (dateRange === 'Weekly') cutoffDays = 7;
    else if (dateRange === 'Quarterly') cutoffDays = 90;
    
    const cutoffDate = new Date(now.getTime());
    cutoffDate.setDate(now.getDate() - cutoffDays);
    
    result = result.filter(c => c.rawDate >= cutoffDate);
  }

  // 2. District Filter
  if (district && district !== 'All') {
    result = result.filter(c => c.district === district);
  }

  // 3. Police Station Filter
  if (policeStation && policeStation !== 'All') {
    result = result.filter(c => c.policeStation === policeStation);
  }

  // 4. Category Filter
  if (category && category !== 'All') {
    result = result.filter(c => c.category === category);
  }

  // 5. Status Filter
  if (status && status !== 'All') {
    result = result.filter(c => c.status === status);
  }

  return result;
};

// SIMULATED API CALLS

// 1. GET /dashboard/summary
export const getDashboardSummary = (filters) => {
  const filtered = getFilteredCases(filters);
  const total = filtered.length;
  const active = filtered.filter(c => c.status === 'Active' || c.status === 'Investigating').length;
  const closed = filtered.filter(c => c.status === 'Closed').length;
  const totalArrests = filtered.reduce((acc, c) => acc + c.arrests, 0);

  // Derive comparative rates based on some variance relative to filters
  // This makes the percentages update dynamically and look alive
  const hash = (JSON.stringify(filters) || 'default').length;
  const fRate = (hash % 15) - 7; // -7% to +7%
  const aRate = (hash % 11) - 5;
  const cRate = (hash % 13) - 4;
  const arrRate = (hash % 9) - 3;

  return {
    totalFIRs: { value: total, trend: fRate >= 0 ? 'up' : 'down', percentage: `${Math.abs(fRate).toFixed(1)}%` },
    activeCases: { value: active, trend: aRate >= 0 ? 'up' : 'down', percentage: `${Math.abs(aRate).toFixed(1)}%` },
    closedCases: { value: closed, trend: cRate >= 0 ? 'up' : 'down', percentage: `${Math.abs(cRate).toFixed(1)}%` },
    totalArrests: { value: totalArrests, trend: arrRate >= 0 ? 'up' : 'down', percentage: `${Math.abs(arrRate).toFixed(1)}%` },
  };
};

// 2. GET /dashboard/categories
export const getDashboardCategories = (filters) => {
  const filtered = getFilteredCases(filters);
  const map = {};
  
  // Count by category
  filtered.forEach(c => {
    map[c.category] = (map[c.category] || 0) + 1;
  });

  const total = filtered.length || 1;
  
  return CATEGORIES.map(cat => {
    const count = map[cat] || 0;
    return {
      category: cat,
      count,
      percentage: Math.round((count / total) * 100)
    };
  }).filter(c => c.count > 0);
};

// 3. GET /dashboard/districts
export const getDashboardDistricts = (filters) => {
  const filtered = getFilteredCases(filters);
  const map = {};
  
  filtered.forEach(c => {
    map[c.district] = (map[c.district] || 0) + 1;
  });

  return DISTRICTS.map(d => ({
    district: d,
    count: map[d] || 0
  })).filter(item => item.count > 0)
     .sort((a, b) => b.count - a.count);
};

// 4. GET /dashboard/trends
export const getDashboardTrends = (filters) => {
  const filtered = getFilteredCases(filters);
  
  // Daily Trend (last 10 active days represented in date strings)
  const dailyMap = {};
  filtered.forEach(c => {
    // extract day/month
    const dStr = c.rawDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    dailyMap[dStr] = (dailyMap[dStr] || 0) + 1;
  });

  const dailyTrends = Object.keys(dailyMap).map(date => ({
    date,
    count: dailyMap[date]
  })).sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-10); // last 10 days

  // Monthly Trend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyMap = {};
  filtered.forEach(c => {
    const mStr = months[c.rawDate.getMonth()];
    monthlyMap[mStr] = (monthlyMap[mStr] || 0) + 1;
  });

  const monthlyTrends = months.map(m => ({
    month: m,
    count: monthlyMap[m] || 0
  }));

  // Yearly summary (last 5 years)
  const yearlyMap = {};
  filtered.forEach(c => {
    const yStr = c.rawDate.getFullYear().toString();
    yearlyMap[yStr] = (yearlyMap[yStr] || 0) + 1;
  });

  const currentYear = 2026;
  const yearlyTrends = [];
  for (let y = currentYear - 4; y <= currentYear; y++) {
    const yStr = y.toString();
    yearlyTrends.push({
      year: yStr,
      count: yearlyMap[yStr] || Math.max(2, Math.floor(filtered.length / 5) + (y % 3) * 5)
    });
  }

  return {
    daily: dailyTrends.length > 0 ? dailyTrends : [
      { date: '19 Jul', count: 5 }, { date: '20 Jul', count: 8 }, { date: '21 Jul', count: 4 }, { date: '22 Jul', count: 11 }, { date: '23 Jul', count: 9 }
    ],
    monthly: monthlyTrends,
    yearly: yearlyTrends
  };
};

// 5. GET /dashboard/recent-cases
export const getDashboardRecentCases = (filters) => {
  return getFilteredCases(filters);
};

// 6. GET /dashboard/alerts
export const getDashboardAlerts = (filters) => {
  const { district, category } = filters;
  
  return MOCK_ALERTS.filter(alert => {
    if (district && district !== 'All' && alert.district !== 'All' && alert.district !== district) {
      return false;
    }
    if (category && category !== 'All' && alert.category !== 'All' && alert.category !== category) {
      return false;
    }
    return true;
  });
};
