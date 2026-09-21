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

// The business console stores its token here after sign-in. Keeping it in
// one place means every authenticated call picks it up automatically.
const TOKEN_KEY = 'yatra360.business.token'

export const businessToken = {
  get: () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } },
  set: (t) => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY) } catch {} },
  clear: () => { try { localStorage.removeItem(TOKEN_KEY) } catch {} },
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  if (auth) {
    const token = businessToken.get()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: Object.keys(headers).length ? headers : undefined,
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
  const entries = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '')
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

  // Locations + route comparison (Transit & Routes)
  getLocations: () => request('/api/locations'),
  compareRoutes: (fromLocation, destination) =>
    request('/api/routes/compare', {
      method: 'POST',
      body: { fromLocation, destination },
    }),

  // Safety / weather
  getEmergencyContacts: () => request('/api/safety/emergency-contacts'),
  getWeather: (location) => request(`/api/safety/weather${query({ location })}`),

  // Parking / city reports
  getParkingSpots: () => request('/api/parking'),
  getReports: () => request('/api/reports'),
  createReport: (report) => request('/api/reports', { method: 'POST', body: report }),

  // ---- Local business ecosystem (tourist-facing) ----
  getLocalBusinesses: (params) => request(`/api/local/businesses${query(params)}`),
  getLocalsFavourites: (limit) => request(`/api/local/favourites${query({ limit })}`),
  // Fire-and-forget: a failed impression must never break the page.
  recordBusinessView: (businessId, source = 'listing') =>
    request(`/api/local/businesses/${encodeURIComponent(businessId)}/view${query({ source })}`, {
      method: 'POST',
    }).catch(() => null),

  // ---- Business console (owner-facing, token authenticated) ----
  business: {
    categories: () => request('/api/business/categories'),
    register: (payload) => request('/api/business/register', { method: 'POST', body: payload }),
    login: (email, password) =>
      request('/api/business/login', { method: 'POST', body: { email, password } }),
    me: () => request('/api/business/me', { auth: true }),
    updateMe: (payload) => request('/api/business/me', { method: 'PATCH', body: payload, auth: true }),
    // Query params are not alias-generated on the backend, so this stays
    // snake_case to match the FastAPI signature.
    dashboard: (radiusKm) =>
      request(`/api/business/dashboard${query({ radius_km: radiusKm })}`, { auth: true }),
    analytics: () => request('/api/business/analytics', { auth: true }),
    actOnOpportunity: (id, action) =>
      request(`/api/business/opportunities/${encodeURIComponent(id)}/${action}`, {
        method: 'POST',
        auth: true,
      }),
    clearOpportunity: (id) =>
      request(`/api/business/opportunities/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        auth: true,
      }),
  },

  // Health check, handy for a "backend unreachable" banner
  health: () => request('/api/health'),
}

export { ApiError }
