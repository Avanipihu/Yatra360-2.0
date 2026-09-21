import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, businessToken } from '../services/api'

/**
 * Session state for the business console.
 *
 * The token lives in localStorage and is replayed on mount, so an owner who
 * refreshes mid-shift stays signed in. Everything else — the profile, the
 * dashboard — is fetched fresh, because crowd data goes stale in minutes.
 */
const BusinessAuthContext = createContext(null)

export function BusinessAuthProvider({ children }) {
  const [business, setBusiness] = useState(null)
  const [isReady, setIsReady] = useState(false)

  // Replay any stored token once on mount.
  useEffect(() => {
    let cancelled = false
    if (!businessToken.get()) {
      setIsReady(true)
      return () => { cancelled = true }
    }
    api.business.me()
      .then(me => { if (!cancelled) setBusiness(me) })
      .catch(() => {
        // Expired or revoked — drop it rather than looping on 401s.
        businessToken.clear()
        if (!cancelled) setBusiness(null)
      })
      .finally(() => { if (!cancelled) setIsReady(true) })
    return () => { cancelled = true }
  }, [])

  const signIn = useCallback(async (email, password) => {
    const session = await api.business.login(email, password)
    businessToken.set(session.token)
    setBusiness(session.business)
    return session.business
  }, [])

  const register = useCallback(async (payload) => {
    const session = await api.business.register(payload)
    businessToken.set(session.token)
    setBusiness(session.business)
    return session.business
  }, [])

  const signOut = useCallback(() => {
    businessToken.clear()
    setBusiness(null)
  }, [])

  const updateProfile = useCallback(async (payload) => {
    const updated = await api.business.updateMe(payload)
    setBusiness(updated)
    return updated
  }, [])

  const value = useMemo(
    () => ({ business, isReady, isSignedIn: Boolean(business), signIn, register, signOut, updateProfile }),
    [business, isReady, signIn, register, signOut, updateProfile]
  )

  return (
    <BusinessAuthContext.Provider value={value}>
      {children}
    </BusinessAuthContext.Provider>
  )
}

export function useBusinessAuth() {
  const ctx = useContext(BusinessAuthContext)
  if (!ctx) throw new Error('useBusinessAuth must be used within a BusinessAuthProvider')
  return ctx
}
