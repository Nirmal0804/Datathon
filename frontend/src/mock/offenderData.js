// Karnataka Police repeat offenders database - dossiers store for Module 7.
// Connects demographic, timeline, arrest, movement, associates, and case histories.

export const MOCK_OFFENDERS_DOSSIERS = {
  'Ramesh Kumar': {
    name: 'Ramesh Kumar',
    aliases: 'Ranga, Red Ramesh',
    age: 38,
    gender: 'Male',
    status: 'Wanted',
    riskScore: 92,
    riskLevel: 'Critical',
    totalCases: 12,
    totalArrests: 6,
    activeWarrants: 2,
    lastKnownDistrict: 'Bengaluru City',
    initials: 'RK',
    crimeCategories: [
      { name: 'Theft', count: 6, percentage: 50 },
      { name: 'Assault', count: 3, percentage: 25 },
      { name: 'Drug', count: 1, percentage: 8.3 },
      { name: 'Cyber', count: 0, percentage: 0 },
      { name: 'Fraud', count: 1, percentage: 8.3 },
      { name: 'Other', count: 1, percentage: 8.3 }
    ],
    offenseTimeline: [
      { date: '2026-07-22', type: 'Armed Robbery', fir: 'FIR-2026-1022', station: 'Cubbon Park PS', status: 'Investigation' },
      { date: '2026-05-14', type: 'Assault', fir: 'FIR-2026-0810', station: 'Devaraja PS', status: 'Court Pending' },
      { date: '2025-11-02', type: 'House Breaking', fir: 'FIR-2025-0450', station: 'Indiranagar PS', status: 'Closed' },
      { date: '2025-06-19', type: 'Robbery', fir: 'FIR-2025-0182', station: 'Saraswathipuram PS', status: 'Closed' }
    ],
    arrestHistory: [
      { date: '2026-05-15', station: 'Devaraja PS', officer: 'Inspector Patil', charges: 'Section 324 IPC (Assault)', outcome: 'Charge Sheeted', bailStatus: 'Released on Bail' },
      { date: '2025-06-20', station: 'Saraswathipuram PS', officer: 'Sub-Inspector Rao', charges: 'Section 392 IPC (Robbery)', outcome: 'Convicted (6m)', bailStatus: 'Served Term' }
    ],
    districtMovement: [
      { district: 'Mysuru', date: '2025-06', activity: 'High' },
      { district: 'Mandya', date: '2025-09', activity: 'Low' },
      { district: 'Bengaluru City', date: '2025-11', activity: 'Critical' },
      { district: 'Tumakuru', date: '2026-04', activity: 'Medium' }
    ],
    highestActivityDistrict: 'Bengaluru City',
    knownAssociates: [
      { name: 'Suresh Gowda', relationship: 'Co-defendant', sharedCases: 3, riskLevel: 'Critical' },
      { name: 'Anand Shekar', relationship: 'Technical Advisor', sharedCases: 1, riskLevel: 'High' }
    ],
    caseHistory: [
      { id: 'CASE-RK-101', fir: 'FIR-2026-1022', category: 'Theft', date: '2026-07-22', station: 'Cubbon Park PS', officer: 'Inspector Patil', status: 'Active', courtStatus: 'Pending Charge Sheet' },
      { id: 'CASE-RK-102', fir: 'FIR-2026-0810', category: 'Assault', date: '2026-05-14', station: 'Devaraja PS', officer: 'Sub-Inspector Gowda', status: 'Under Investigation', courtStatus: 'Bail Hearing Scheduled' },
      { id: 'CASE-RK-103', fir: 'FIR-2025-0450', category: 'Theft', date: '2025-11-02', station: 'Indiranagar PS', officer: 'Inspector Patil', status: 'Resolved', courtStatus: 'Case Closed' }
    ],
    aiRiskAssessment: {
      riskLevel: 'Critical',
      confidence: 94,
      reasoning: [
        'High number of repeat offenses (12 total cases logged)',
        'Escalating crime severity from petty theft to armed robbery',
        'Multiple districts involved (Mysuru, Mandya, Bengaluru)',
        'Active warrants pending for recent July 2026 incident'
      ]
    }
  },
  'Suresh Gowda': {
    name: 'Suresh Gowda',
    aliases: 'Kariya, Blackie',
    age: 42,
    gender: 'Male',
    status: 'In Custody',
    riskScore: 88,
    riskLevel: 'Critical',
    totalCases: 9,
    totalArrests: 5,
    activeWarrants: 0,
    lastKnownDistrict: 'Mysuru',
    initials: 'SG',
    crimeCategories: [
      { name: 'Theft', count: 2, percentage: 22.2 },
      { name: 'Assault', count: 1, percentage: 11.1 },
      { name: 'Drug', count: 5, percentage: 55.6 },
      { name: 'Cyber', count: 0, percentage: 0 },
      { name: 'Fraud', count: 0, percentage: 0 },
      { name: 'Other', count: 1, percentage: 11.1 }
    ],
    offenseTimeline: [
      { date: '2026-07-20', type: 'Drug Trafficking', fir: 'FIR-2026-1011', station: 'Devaraja PS', status: 'In Custody' },
      { date: '2026-03-12', type: 'Possession of Contraband', fir: 'FIR-2026-0312', station: 'Gokul Road PS', status: 'Court Pending' },
      { date: '2025-09-18', type: 'Drug distribution', fir: 'FIR-2025-0918', station: 'Cubbon Park PS', status: 'Closed' }
    ],
    arrestHistory: [
      { date: '2026-07-21', station: 'Devaraja PS', officer: 'Inspector Patil', charges: 'NDPS Act Section 20', outcome: 'Remanded', bailStatus: 'Bail Denied' },
      { date: '2025-09-19', station: 'Cubbon Park PS', officer: 'Inspector Patil', charges: 'Drug Possession', outcome: 'Fined', bailStatus: 'Released' }
    ],
    districtMovement: [
      { district: 'Hubballi-Dharwad', date: '2026-03', activity: 'Medium' },
      { district: 'Bengaluru City', date: '2025-09', activity: 'Low' },
      { district: 'Mysuru', date: '2026-07', activity: 'Critical' }
    ],
    highestActivityDistrict: 'Mysuru',
    knownAssociates: [
      { name: 'Ramesh Kumar', relationship: 'Co-conspirator', sharedCases: 3, riskLevel: 'Critical' }
    ],
    caseHistory: [
      { id: 'CASE-SG-201', fir: 'FIR-2026-1011', category: 'Drug', date: '2026-07-20', station: 'Devaraja PS', officer: 'Inspector Patil', status: 'Active', courtStatus: 'Trial in Progress' }
    ],
    aiRiskAssessment: {
      riskLevel: 'Critical',
      confidence: 91,
      reasoning: [
        'Repeat narcotics trafficking charges',
        'Direct association links to wanted offender Ramesh Kumar',
        'Recent high-volume transport activity'
      ]
    }
  },
  'Anand Shekar': {
    name: 'Anand Shekar',
    aliases: 'Tech Anand, Proxy',
    age: 29,
    gender: 'Male',
    status: 'Released',
    riskScore: 78,
    riskLevel: 'High',
    totalCases: 7,
    totalArrests: 2,
    activeWarrants: 0,
    lastKnownDistrict: 'Bengaluru City',
    initials: 'AS',
    crimeCategories: [
      { name: 'Theft', count: 0, percentage: 0 },
      { name: 'Assault', count: 0, percentage: 0 },
      { name: 'Drug', count: 0, percentage: 0 },
      { name: 'Cyber', count: 5, percentage: 71.4 },
      { name: 'Fraud', count: 2, percentage: 28.6 },
      { name: 'Other', count: 0, percentage: 0 }
    ],
    offenseTimeline: [
      { date: '2026-07-18', type: 'Online Phishing', fir: 'FIR-2026-0985', station: 'Indiranagar PS', status: 'Bail Released' },
      { date: '2026-02-14', type: 'Identity Theft', fir: 'FIR-2026-0214', station: 'Whitefield PS', status: 'Closed' }
    ],
    arrestHistory: [
      { date: '2026-07-19', station: 'Indiranagar PS', officer: 'Sub-Inspector Rao', charges: 'IT Act Section 66D', outcome: 'Charge Sheeted', bailStatus: 'Released on Bail' }
    ],
    districtMovement: [
      { district: 'Bengaluru City', date: '2026-02', activity: 'Critical' }
    ],
    highestActivityDistrict: 'Bengaluru City',
    knownAssociates: [
      { name: 'Ramesh Kumar', relationship: 'Technical Provider', sharedCases: 1, riskLevel: 'Critical' }
    ],
    caseHistory: [
      { id: 'CASE-AS-301', fir: 'FIR-2026-0985', category: 'Cyber', date: '2026-07-18', station: 'Indiranagar PS', officer: 'Sub-Inspector Rao', status: 'Active', courtStatus: 'Awaiting Summons' }
    ],
    aiRiskAssessment: {
      riskLevel: 'High',
      confidence: 85,
      reasoning: [
        'Sophisticated phishing network setups',
        'Cyber fraud logs targeting local tech sectors',
        'Recent offense logs in July 2026'
      ]
    }
  },
  'Mohammad Ali': {
    name: 'Mohammad Ali',
    aliases: 'Chabi, Keys',
    age: 34,
    gender: 'Male',
    status: 'Released',
    riskScore: 65,
    riskLevel: 'Medium',
    totalCases: 6,
    totalArrests: 4,
    activeWarrants: 0,
    lastKnownDistrict: 'Hubballi-Dharwad',
    initials: 'MA',
    crimeCategories: [
      { name: 'Theft', count: 4, percentage: 66.7 },
      { name: 'Assault', count: 0, percentage: 0 },
      { name: 'Drug', count: 0, percentage: 0 },
      { name: 'Cyber', count: 0, percentage: 0 },
      { name: 'Fraud', count: 1, percentage: 16.7 },
      { name: 'Other', count: 1, percentage: 16.7 }
    ],
    offenseTimeline: [
      { date: '2026-07-14', type: 'Vehicle Theft', fir: 'FIR-2026-0914', station: 'Gokul Road PS', status: 'Released' }
    ],
    arrestHistory: [
      { date: '2026-07-15', station: 'Gokul Road PS', officer: 'Sub-Inspector Gowda', charges: 'Section 379 IPC', outcome: 'Discharged', bailStatus: 'Released' }
    ],
    districtMovement: [
      { district: 'Hubballi-Dharwad', date: '2026-07', activity: 'High' }
    ],
    highestActivityDistrict: 'Hubballi-Dharwad',
    knownAssociates: [],
    caseHistory: [
      { id: 'CASE-MA-401', fir: 'FIR-2026-0914', category: 'Theft', date: '2026-07-14', station: 'Gokul Road PS', officer: 'Sub-Inspector Gowda', status: 'Closed', courtStatus: 'Acquitted' }
    ],
    aiRiskAssessment: {
      riskLevel: 'Medium',
      confidence: 76,
      reasoning: [
        'Frequent vehicle break-ins history',
        'Steady activity index in Hubballi sector'
      ]
    }
  },
  'Priya Nair': {
    name: 'Priya Nair',
    aliases: 'Madam, Ledger',
    age: 31,
    gender: 'Female',
    status: 'Released',
    riskScore: 48,
    riskLevel: 'Low',
    totalCases: 4,
    totalArrests: 1,
    activeWarrants: 0,
    lastKnownDistrict: 'Bengaluru City',
    initials: 'PN',
    crimeCategories: [
      { name: 'Theft', count: 0, percentage: 0 },
      { name: 'Assault', count: 0, percentage: 0 },
      { name: 'Drug', count: 0, percentage: 0 },
      { name: 'Cyber', count: 1, percentage: 25 },
      { name: 'Fraud', count: 3, percentage: 75 },
      { name: 'Other', count: 0, percentage: 0 }
    ],
    offenseTimeline: [
      { date: '2026-07-10', type: 'Corporate Fraud', fir: 'FIR-2026-0884', station: 'Whitefield PS', status: 'Bail Released' }
    ],
    arrestHistory: [
      { date: '2026-07-11', station: 'Whitefield PS', officer: 'Rao', charges: 'Section 420 IPC', outcome: 'Pending Trial', bailStatus: 'Released' }
    ],
    districtMovement: [
      { district: 'Bengaluru City', date: '2026-07', activity: 'Medium' }
    ],
    highestActivityDistrict: 'Bengaluru City',
    knownAssociates: [],
    caseHistory: [
      { id: 'CASE-PN-501', fir: 'FIR-2026-0884', category: 'Fraud', date: '2026-07-10', station: 'Whitefield PS', officer: 'Rao', status: 'Active', courtStatus: 'Pending Trial' }
    ],
    aiRiskAssessment: {
      riskLevel: 'Low',
      confidence: 68,
      reasoning: [
        'Fraud incidents limited to financial accounts skimming',
        'No record of violent escalation'
      ]
    }
  },
  'Vikram Singh': {
    name: 'Vikram Singh',
    aliases: 'Vikky, Hammer',
    age: 35,
    gender: 'Male',
    status: 'Released',
    riskScore: 35,
    riskLevel: 'Low',
    totalCases: 3,
    totalArrests: 2,
    activeWarrants: 0,
    lastKnownDistrict: 'Hubballi-Dharwad',
    initials: 'VS',
    crimeCategories: [
      { name: 'Theft', count: 2, percentage: 66.7 },
      { name: 'Assault', count: 0, percentage: 0 },
      { name: 'Drug', count: 0, percentage: 0 },
      { name: 'Cyber', count: 0, percentage: 0 },
      { name: 'Fraud', count: 0, percentage: 0 },
      { name: 'Other', count: 1, percentage: 33.3 }
    ],
    offenseTimeline: [
      { date: '2026-07-05', type: 'Property Trespass', fir: 'FIR-2026-0705', station: 'Vidyanagar PS', status: 'Closed' }
    ],
    arrestHistory: [
      { date: '2026-07-06', station: 'Vidyanagar PS', officer: 'Gowda', charges: 'Section 447 IPC', outcome: 'Compounded', bailStatus: 'Released' }
    ],
    districtMovement: [
      { district: 'Hubballi-Dharwad', date: '2026-07', activity: 'Low' }
    ],
    highestActivityDistrict: 'Hubballi-Dharwad',
    knownAssociates: [],
    caseHistory: [
      { id: 'CASE-VS-601', fir: 'FIR-2026-0705', category: 'Theft', date: '2026-07-05', station: 'Vidyanagar PS', officer: 'Gowda', status: 'Closed', courtStatus: 'Compounded' }
    ],
    aiRiskAssessment: {
      riskLevel: 'Low',
      confidence: 62,
      reasoning: [
        'Minor trespass charges',
        'Low risk of recidivism'
      ]
    }
  }
};
