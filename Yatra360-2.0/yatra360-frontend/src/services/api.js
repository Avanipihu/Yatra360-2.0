// Single place the frontend talks to the FastAPI backend from.
// In dev, VITE_API_URL falls back to the local uvicorn server.
// In production (Render static site), set VITE_API_URL to the
// deployed backend's URL as a build-time environment variable.
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new ApiError(`Could not reach the Yatra360 API at ${API_BASE}. Is the backend running?`, 0)
  }

  if (!response.ok) {
    let detail = response.statusText
    try {
      const data = await response.json()
      detail = data.detail || detail
    } catch {
      // response body wasn't JSON; keep statusText
    }
    throw new ApiError(detail, response.status)
  }

  if (response.status === 204) return null
  return response.json()
}

function query(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  if (entries.length === 0) return ''
  return '?' + new URLSearchParams(entries).toString()
}

export const api = {
  // Places
  getPlaces: (params) => request(`/api/places${query(params)}`),
  getPlace: (placeId) => request(`/api/places/${encodeURIComponent(placeId)}`),

  // Hotels
  getHotels: (budget) => request(`/api/hotels${query({ budget })}`),

  // Itinerary
  generateItinerary: (profile) => request('/api/itinerary/generate', { method: 'POST', body: profile }),
  getTrip: (tripId) => request(`/api/itinerary/${encodeURIComponent(tripId)}`),

  // Crowd redistribution
  getAlternativesForPlaces: (placeIds) =>
    request('/api/crowd/alternatives', { method: 'POST', body: { placeIds } }),

  // Mobility
  getRoutes: (to) => request(`/api/mobility/routes${query({ to })}`),

  // Safety / weather
  getEmergencyContacts: () => request('/api/safety/emergency-contacts'),
  getWeather: (location) => request(`/api/safety/weather${query({ location })}`),

  // Parking / city reports
  getParkingSpots: () => request('/api/parking'),
  getReports: () => request('/api/reports'),
  createReport: (report) => request('/api/reports', { method: 'POST', body: report }),

  // Health check, handy for a "backend unreachable" banner
  health: () => request('/api/health'),
}

export { ApiError }
