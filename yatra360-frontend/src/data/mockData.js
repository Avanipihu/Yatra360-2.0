// Mock data layer for the Yatra360 tourist dashboard prototype.
// Shape mirrors the eventual PostgreSQL tables (Place, Hotel, RouteOption,
// EmergencyContact, Report, ParkingSpot) so the FastAPI backend can swap
// this out with real queries without changing the frontend contract.

export const INTERESTS = [
  'History', 'Culture', 'Food', 'Nature', 'Shopping',
  'Adventure', 'Spiritual', 'Photography', 'Local experiences', 'Hidden gems'
]

export const GROUP_TYPES = ['Solo', 'Couple', 'Family', 'Friends', 'Senior citizens']
export const BUDGETS = ['Low', 'Moderate', 'Premium']
export const MOBILITY_PREFS = ['Walking', 'Public transport', 'Metro', 'Bus', 'Auto', 'Cab', 'Mixed']
export const ACCESSIBILITY = ['Minimal walking', 'Wheelchair accessible', 'Elderly-friendly', 'Child-friendly']

export const PLACES = [
  {
    id: 'shaniwarwada',
    name: 'Shaniwar Wada',
    category: 'History',
    lat: 18.5195, lon: 73.8553,
    openHours: '8:00 AM – 6:30 PM',
    cost: 'Low',
    estimatedDemand: 'High',
    accessibility: ['Minimal walking'],
    goodFor: ['Family', 'Solo', 'Friends', 'Couple'],
    description: 'Historic fortification and the seat of the Peshwas, known for its light-and-sound show.',
    source: 'Maharashtra Tourism (MTDC)',
    lastVerified: '2026-08-14'
  },
  {
    id: 'aga-khan-palace',
    name: 'Aga Khan Palace',
    category: 'History',
    lat: 18.5525, lon: 73.9012,
    openHours: '9:00 AM – 5:30 PM',
    cost: 'Low',
    estimatedDemand: 'Moderate',
    accessibility: ['Minimal walking', 'Elderly-friendly', 'Child-friendly'],
    goodFor: ['Family', 'Senior citizens', 'Solo'],
    description: 'Spacious heritage grounds linked to Gandhi\u2019s internment; quieter alternative to central-city forts.',
    source: 'ASI Pune Circle',
    lastVerified: '2026-08-10'
  },
  {
    id: 'sinhagad-fort',
    name: 'Sinhagad Fort',
    category: 'Adventure',
    lat: 18.3664, lon: 73.7550,
    openHours: 'Open 24 hours (visits recommended 7 AM – 6 PM)',
    cost: 'Low',
    estimatedDemand: 'High',
    accessibility: [],
    goodFor: ['Friends', 'Adventure seekers', 'Couple'],
    description: 'Hilltop fort with trekking trails and panoramic Sahyadri views; steep walking required.',
    source: 'Pune District Tourism',
    lastVerified: '2026-08-01'
  },
  {
    id: 'dagdusheth-temple',
    name: 'Dagdusheth Halwai Ganpati Temple',
    category: 'Spiritual',
    lat: 18.5164, lon: 73.8553,
    openHours: '6:00 AM – 11:30 PM',
    cost: 'Free',
    estimatedDemand: 'High',
    accessibility: ['Minimal walking', 'Child-friendly'],
    goodFor: ['Family', 'Solo', 'Senior citizens'],
    description: 'One of Pune\u2019s most visited temples, especially crowded on weekends and festival days.',
    source: 'Pune Municipal Corporation (PMC)',
    lastVerified: '2026-08-14'
  },
  {
    id: 'tulshibaug-ram-mandir',
    name: 'Tulshibaug Ram Mandir & Market',
    category: 'Local experiences',
    lat: 18.5158, lon: 73.8547,
    openHours: '8:00 AM – 9:00 PM',
    cost: 'Free',
    estimatedDemand: 'Moderate',
    accessibility: ['Child-friendly'],
    goodFor: ['Family', 'Friends', 'Solo'],
    description: 'A quieter spiritual stop next to a bustling local market \u2014 a lower-demand alternative near Dagdusheth.',
    source: 'PMC Heritage Cell',
    lastVerified: '2026-08-05'
  },
  {
    id: 'osho-garden',
    name: 'Osho Teerth Park',
    category: 'Nature',
    lat: 18.5362, lon: 73.8935,
    openHours: '6:00 AM – 9:00 PM',
    cost: 'Free',
    estimatedDemand: 'Low',
    accessibility: ['Minimal walking', 'Elderly-friendly', 'Wheelchair accessible', 'Child-friendly'],
    goodFor: ['Family', 'Senior citizens', 'Solo'],
    description: 'A landscaped, low-crowd park \u2014 good for children and elderly travellers who need rest points.',
    source: 'PMC Garden Dept.',
    lastVerified: '2026-07-28'
  },
  {
    id: 'phlox-cafe',
    name: 'Phlox Local Thali House',
    category: 'Food',
    lat: 18.5100, lon: 73.8300,
    openHours: '12:00 PM – 10:30 PM',
    cost: 'Moderate',
    estimatedDemand: 'Moderate',
    accessibility: ['Child-friendly'],
    goodFor: ['Family', 'Friends', 'Solo'],
    description: 'Home-style Maharashtrian thali, popular with families for early dinners.',
    source: 'Curated (team-verified)',
    lastVerified: '2026-08-12'
  }
]

export const HOTELS = [
  {
    id: 'hotel-1',
    name: 'Hotel Sunderban',
    area: 'Shivajinagar',
    pricePerNight: 2200,
    budget: 'Moderate',
    rating: 4.1,
    distanceToCenterKm: 1.8,
    source: 'Sample data (govt. tourism API pending)'
  },
  {
    id: 'hotel-2',
    name: 'Backpacker Panda Koregaon Park',
    area: 'Koregaon Park',
    pricePerNight: 900,
    budget: 'Low',
    rating: 4.3,
    distanceToCenterKm: 3.2,
    source: 'Sample data (govt. tourism API pending)'
  },
  {
    id: 'hotel-3',
    name: 'The Pune Residency',
    area: 'Camp',
    pricePerNight: 5400,
    budget: 'Premium',
    rating: 4.6,
    distanceToCenterKm: 0.9,
    source: 'Sample data (govt. tourism API pending)'
  }
]

// Mocked route comparisons keyed by destination id
export const ROUTE_OPTIONS = {
  default: [
    { mode: 'Bus + Metro', costInr: 40, timeMin: 55, walkingM: 500, notes: 'Cheapest option, one interchange at Shivajinagar' },
    { mode: 'Auto + Walk', costInr: 120, timeMin: 35, walkingM: 600, notes: 'Faster, moderate walking' },
    { mode: 'Cab', costInr: 220, timeMin: 25, walkingM: 50, notes: 'Least walking, highest cost' },
    { mode: 'Walk', costInr: 0, timeMin: 70, walkingM: 4200, notes: 'Only suitable if minimal-walking is not a constraint' }
  ]
}

export const EMERGENCY_CONTACTS = [
  { type: 'Police', name: 'Pune City Police Control Room', number: '100', area: 'City-wide', source: 'Maharashtra Police', lastVerified: '2026-09-01' },
  { type: 'Women\u2019s Helpline', name: 'Women Helpline (All India)', number: '1091', area: 'City-wide', source: 'Ministry of Women & Child Development', lastVerified: '2026-09-01' },
  { type: 'Ambulance', name: 'Emergency Medical Services', number: '108', area: 'City-wide', source: 'Maharashtra Emergency Medical Services', lastVerified: '2026-09-01' },
  { type: 'Hospital', name: 'Sassoon General Hospital', number: '020-2612-8000', area: 'Near Shaniwar Wada', source: 'Sassoon Hospital, PMC', lastVerified: '2026-08-20' },
  { type: 'Tourist Helpline', name: 'Maharashtra Tourism Helpline', number: '1800-22-1000', area: 'State-wide', source: 'MTDC', lastVerified: '2026-08-15' }
]

export const WEATHER_MOCK = {
  location: 'Pune',
  condition: 'Light rain expected in the afternoon',
  tempC: 24,
  humidity: 78,
  advisory: 'Outdoor/walking-heavy stops are best scheduled before 1 PM.'
}

// Crowd redistribution pairs: overcrowded -> suggested alternative
export const CROWD_ALTERNATIVES = [
  { overcrowdedId: 'shaniwarwada', alternativeId: 'aga-khan-palace', sharedTag: 'Peshwa-era history, similar architecture' },
  { overcrowdedId: 'dagdusheth-temple', alternativeId: 'tulshibaug-ram-mandir', sharedTag: 'Spiritual experience, walking distance apart' }
]

export const PARKING_SPOTS = [
  { id: 'p1', near: 'Shaniwar Wada', availability: 'Low', note: 'Weekend footfall fills the paid lot by 11 AM \u2014 arrive early or use two-wheeler stand.' },
  { id: 'p2', near: 'Aga Khan Palace', availability: 'High', note: 'Large open lot, rarely full even on weekends.' },
  { id: 'p3', near: 'Dagdusheth Temple', availability: 'Low', note: 'No dedicated lot nearby; nearest paid parking is 400m away.' },
  { id: 'p4', near: 'Osho Teerth Park', availability: 'Moderate', note: 'Street parking generally available on weekdays.' }
]

export const CITY_REPORT_TYPES = ['Pothole', 'Waterlogging', 'Broken streetlight', 'Blocked footpath', 'Other']
