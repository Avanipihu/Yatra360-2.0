import { useCallback, useEffect, useState } from 'react'
import { api } from '../services/api'

/**
 * Loads the console's dashboard payload and keeps it fresh.
 *
 * Crowd levels move on the scale of minutes, so a stale dashboard is worse
 * than a loading one — hence the poll. It's deliberately gentle (three
 * minutes) because the underlying model is hourly.
 */
const REFRESH_MS = 3 * 60 * 1000

export function useDashboard(radiusKm = 2.5) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = useCallback(async (quiet = false) => {
    if (!quiet) setIsLoading(true)
    try {
      const payload = await api.business.dashboard(radiusKm)
      setData(payload)
      setError(null)
    } catch (err) {
      setError(err.message || 'Could not load your dashboard.')
    } finally {
      setIsLoading(false)
    }
  }, [radiusKm])

  useEffect(() => {
    let cancelled = false
    load()
    const timer = setInterval(() => { if (!cancelled) load(true) }, REFRESH_MS)
    return () => { cancelled = true; clearInterval(timer) }
  }, [load])

  // Optimistic: the card should respond instantly, then reconcile.
  const actOnOpportunity = useCallback(async (id, action) => {
    setData(prev => prev && ({
      ...prev,
      opportunities: prev.opportunities.map(o =>
        o.id === id ? { ...o, status: action === 'accept' ? 'accepted' : 'dismissed' } : o
      ),
    }))
    try {
      await api.business.actOnOpportunity(id, action)
    } catch {
      load(true)
    }
  }, [load])

  const clearOpportunity = useCallback(async (id) => {
    setData(prev => prev && ({
      ...prev,
      opportunities: prev.opportunities.map(o => (o.id === id ? { ...o, status: null } : o)),
    }))
    try {
      await api.business.clearOpportunity(id)
    } catch {
      load(true)
    }
  }, [load])

  return { data, error, isLoading, reload: load, actOnOpportunity, clearOpportunity }
}
