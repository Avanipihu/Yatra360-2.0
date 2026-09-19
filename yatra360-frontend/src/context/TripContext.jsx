import { createContext, useContext, useState, useMemo, useCallback } from 'react'
import { PLACES, CROWD_ALTERNATIVES } from '../data/mockData'

const TripContext = createContext(null)

const emptyProfile = {
  destination: 'Pune',
  startDate: '',
  days: 2,
  groupType: 'Family',
  budget: 'Moderate',
  interests: [],
  mobilityPref: 'Mixed',
  accessibility: [],
  needsHotel: null, // true | false | null (not answered yet)
  selectedHotelId: null
}

function buildItinerary(profile) {
  if (!profile) return []

  const filtered = PLACES.filter(p => {
    const interestMatch = profile.interests.length === 0 || profile.interests.includes(p.category)
    const groupMatch = p.goodFor.includes(profile.groupType) || p.goodFor.length === 0
    return interestMatch && groupMatch
  })

  const pool = filtered.length > 0 ? filtered : PLACES

  const days = []
  const perDay = Math.max(1, Math.ceil(pool.length / profile.days))
  for (let d = 0; d < profile.days; d++) {
    const stops = pool.slice(d * perDay, d * perDay + perDay)
    if (stops.length > 0) {
      days.push({ dayNumber: d + 1, stops })
    }
  }
  return days
}

export function TripProvider({ children }) {
  const [profile, setProfile] = useState(emptyProfile)
  const [itinerary, setItinerary] = useState([])
  const [hasPlanned, setHasPlanned] = useState(false)

  const generateItinerary = useCallback((newProfile) => {
    const merged = { ...profile, ...newProfile }
    setProfile(merged)
    setItinerary(buildItinerary(merged))
    setHasPlanned(true)
  }, [profile])

  const swapPlace = useCallback((oldPlaceId, newPlaceId) => {
    setItinerary(prev => prev.map(day => ({
      ...day,
      stops: day.stops.map(s => {
        if (s.id !== oldPlaceId) return s
        const replacement = PLACES.find(p => p.id === newPlaceId)
        return replacement || s
      })
    })))
  }, [])

  const flaggedForRedistribution = useMemo(() => {
    const activeIds = new Set(itinerary.flatMap(d => d.stops.map(s => s.id)))
    return CROWD_ALTERNATIVES
      .filter(pair => activeIds.has(pair.overcrowdedId))
      .map(pair => ({
        overcrowded: PLACES.find(p => p.id === pair.overcrowdedId),
        alternative: PLACES.find(p => p.id === pair.alternativeId),
        sharedTag: pair.sharedTag
      }))
  }, [itinerary])

  const value = {
    profile,
    itinerary,
    hasPlanned,
    generateItinerary,
    swapPlace,
    flaggedForRedistribution,
    setProfile
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within a TripProvider')
  return ctx
}
