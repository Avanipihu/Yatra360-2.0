// Form option lists for the trip-profile and city-report forms.
// These are UI choices, not data the backend owns, so they stay local
// rather than round-tripping through the API.

export const INTERESTS = [
  'History', 'Culture', 'Food', 'Nature', 'Shopping',
  'Adventure', 'Spiritual', 'Photography', 'Local experiences', 'Hidden gems'
]

export const GROUP_TYPES = ['Solo', 'Couple', 'Family', 'Friends', 'Senior citizens']
export const BUDGET_LABELS = {
  Low: '₹10,000 - ₹20,000',
  Moderate: '₹20,000 - ₹40,000',
  Premium: '₹40,000 - ₹80,000+',
}
export const MOBILITY_PREFS = ['Walking', 'Public transport', 'Metro', 'Bus', 'Auto', 'Cab', 'Mixed']
export const ACCESSIBILITY = ['Minimal walking', 'Wheelchair accessible', 'Elderly-friendly', 'Child-friendly']
export const CITY_REPORT_TYPES = ['Pothole', 'Waterlogging', 'Broken streetlight', 'Blocked footpath', 'Other']
