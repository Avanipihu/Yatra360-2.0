import { createContext, useContext, useState, useMemo, useCallback, useEffect } from 'react'
import { api } from '../services/api'

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

export function TripProvider({ children }) {
  const [profile, setProfile] = useState(emptyProfile)
  const [tripId, setTripId] = useState(null)
  const [itinerary, setItinerary] = useState([])
  const [hasPlanned, setHasPlanned] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generateError, setGenerateError] = useState(null)

  const [hotels, setHotels] = useState([])
  const [flaggedForRedistribution, setFlaggedForRedistribution] = useState([])

  // Hotels are small/static enough to fetch once and reuse for both the
  // onboarding picker and the "staying at" banner on the itinerary page.
  useEffect(() => {
    api.getHotels().then(setHotels).catch(() => setHotels([]))
  }, [])

  const generateItinerary = useCallback(async (newProfile) => {
    const merged = { ...profile, ...newProfile }
    setProfile(merged)
    setIsGenerating(true)
    setGenerateError(null)
    try {
      const trip = await api.generateItinerary(merged)
      setTripId(trip.id)
      setItinerary(trip.itinerary)
      setHasPlanned(true)
    } catch (err) {
      setGenerateError(err.message || 'Could not generate an itinerary right now.')
      setHasPlanned(false)
    } finally {
      setIsGenerating(false)
    }
  }, [profile])

  // The backend has no "edit a stop" endpoint -- swapping is a client-side
  // itinerary edit using a place the crowd-alternatives call already gave us.
  const swapPlace = useCallback((oldPlaceId, newPlace) => {
    setItinerary(prev => prev.map(day => ({
      ...day,
      stops: day.stops.map(s => (s.id === oldPlaceId ? newPlace : s))
    })))
  }, [])

  // Whenever the itinerary changes, ask the backend which of the current
  // stops have a suggested lower-demand alternative.
  useEffect(() => {
    const activeIds = itinerary.flatMap(day => day.stops.map(s => s.id))
    if (activeIds.length === 0) {
      setFlaggedForRedistribution([])
      return
    }
    let cancelled = false
    api.getAlternativesForPlaces(activeIds)
      .then(pairs => { if (!cancelled) setFlaggedForRedistribution(pairs) })
      .catch(() => { if (!cancelled) setFlaggedForRedistribution([]) })
    return () => { cancelled = true }
  }, [itinerary])

  const value = {
    profile,
    tripId,
    itinerary,
    hasPlanned,
    isGenerating,
    generateError,
    generateItinerary,
    swapPlace,
    flaggedForRedistribution,
    hotels,
    setProfile
  }

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>
}

export function useTrip() {
  const ctx = useContext(TripContext)
  if (!ctx) throw new Error('useTrip must be used within a TripProvider')
  return ctx
}
