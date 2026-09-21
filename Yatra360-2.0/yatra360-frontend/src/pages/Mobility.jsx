import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

export default function Mobility() {
  const [searchParams, setSearchParams] = useSearchParams()
  const destinationId = searchParams.get('to')
  const originId = searchParams.get('from')

  const [destination, setDestination] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Form input state
  const [fromInput, setFromInput] = useState(originId || '')
  const [toInput, setToInput] = useState(destinationId || '')

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    // Check if the user is using the manual search form (sending raw text locations)
    if (originId && destinationId && originId !== 'current') {
      
      // Hit the prototype compare endpoint (Port 8000 based on your main.py CORS setup)
      // Note: Update this URL if your backend is hosted on Render instead of localhost
      fetch('http://localhost:8000/api/routes/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from_location: originId, destination: destinationId })
      })
      .then(res => {
        if (!res.ok) throw new Error('Route not found')
        return res.json()
      })
      .then(data => {
        if (cancelled) return
        
        setOrigin({ name: data.from, lat: data.from_coordinates.lat, lon: data.from_coordinates.lon })
        setDestination({ name: data.destination, lat: data.destination_coordinates.lat, lon: data.destination_coordinates.lon })
        
        // Map the prototype payload format to the Yatra360 2.0 frontend UI format
        const mappedOptions = data.routes.map(r => ({
          mode: r.type,
          costInr: r.cost,
          timeMin: r.time,
          walkingM: r.walking,
          notes: r.description
        }))
        setOptions(mappedOptions)
      })
      .catch(err => {
        console.error(err)
        if (!cancelled) {
            setOrigin({ name: originId })
            setDestination({ name: destinationId })
            setOptions([]) // Failsafe empty state
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
      
    } else {
      // Standard Yatra 360 2.0 fallback behavior (When coming from an Itinerary "Directions" click)
      const destinationPromise = destinationId
        ? api.getPlace(destinationId).catch(() => null)
        : Promise.resolve(null)
        
      const originPromise = originId && originId !== 'current'
        ? api.getPlace(originId).catch(() => null)
        : Promise.resolve(null)

      Promise.all([
        originPromise, 
        destinationPromise, 
        api.getRoutes(destinationId || undefined).catch(() => [])
      ])
        .then(([startPlace, endPlace, routes]) => {
          if (cancelled) return
          setOrigin(startPlace)
          setDestination(endPlace)
          setOptions(routes)
        })
        .finally(() => { if (!cancelled) setIsLoading(false) })
    }

    return () => { cancelled = true }
  }, [destinationId, originId])

  // Triggers the URL update, which re-fires the useEffect above
  const handleSearch = (e) => {
    e.preventDefault()
    if (fromInput.trim() && toInput.trim()) {
      setSearchParams({ from: fromInput.trim(), to: toInput.trim() })
    }
  }

  const bbox = destination
    ? `${destination.lon - 0.01}%2C${destination.lat - 0.008}%2C${destination.lon + 0.01}%2C${destination.lat + 0.008}`
    : '73.83%2C18.50%2C73.87%2C18.54'
  const marker = destination ? `&marker=${destination.lat}%2C${destination.lon}` : ''

  return (
    <div className="page">
      <header className="page-header">
        <h1>Smart mobility</h1>
        <p className="page-sub">
          Compared on cost, time and walking distance &mdash; not just distance on a map.
        </p>
      </header>

      {/* Manual Route Planning Form */}
      <form onSubmit={handleSearch} className="profile-form" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--paper-raised)', border: '1px solid var(--basalt-20)', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Plan a specific route</h2>
        <div className="form-row">
          <label>
            Starting Location
            <input 
              type="text" 
              value={fromInput} 
              onChange={e => setFromInput(e.target.value)} 
              placeholder="e.g. Pune Railway Station" 
              required 
            />
          </label>
          <label>
            End Destination
            <input 
              type="text" 
              value={toInput} 
              onChange={e => setToInput(e.target.value)} 
              placeholder="e.g. Shaniwar Wada" 
              required 
            />
          </label>
        </div>
        <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>Compare Routes</button>
      </form>

      {isLoading ? (
        <p className="hint-text">Loading route options&hellip;</p>
      ) : (
        <>
          {(origin || destination) && (
            <div className="stop-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--basalt)' }}>Starting Destination:</strong> {origin ? origin.name : 'Your Current Location'}
              </div>
              <div style={{ fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--basalt)' }}>End Destination:</strong> {destination ? destination.name : 'Not selected'}
              </div>
            </div>
          )}

          {!destination && !originId && (
            <p className="hint-text">No destination selected. Enter your locations above or open this page from an itinerary stop's "Directions" button.</p>
          )}

          {options.length === 0 && (destinationId || originId) ? (
            <p className="hint-text">No route data available for these locations yet. Please try another search.</p>
          ) : (
            <div className="route-compare">
              {options.map((opt, index) => {
                // Safeguard reduce by passing the first option as the initial value
                const isFastest = opt === options.reduce((a, b) => (a.timeMin < b.timeMin ? a : b), options[0]);
                const isCheapest = opt === options.reduce((a, b) => (a.costInr < b.costInr ? a : b), options[0]);
                const isLeastWalking = opt === options.reduce((a, b) => (a.walkingM < b.walkingM ? a : b), options[0]);

                return (
                  <div key={opt.mode || index} className="route-card">
                    <h3>{opt.mode}</h3>
                    <dl className="route-stats">
                      <div><dt>Cost</dt><dd>{opt.costInr === 0 ? 'Free' : `₹${opt.costInr}`}</dd></div>
                      <div><dt>Time</dt><dd>{opt.timeMin} min</dd></div>
                      <div><dt>Walking</dt><dd>{opt.walkingM} m</dd></div>
                    </dl>
                    <p className="route-notes">{opt.notes}</p>
                    <div className="route-badges">
                      {isFastest && <span className="pill pill-teal">Fastest</span>}
                      {isCheapest && <span className="pill pill-gold">Cheapest</span>}
                      {isLeastWalking && <span className="pill pill-teal">Least walking</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="map-embed">
            <iframe
              title="Route map"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik${marker}`}
              loading="lazy"
            />
            <p className="map-caption">Map data &copy; OpenStreetMap contributors</p>
          </div>
        </>
      )}
    </div>
  )
}
