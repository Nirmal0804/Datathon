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
