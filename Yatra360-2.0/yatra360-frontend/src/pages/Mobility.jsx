import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

export default function Mobility() {
  const [searchParams] = useSearchParams()
  const destinationId = searchParams.get('to')
  const originId = searchParams.get('from')

  const [destination, setDestination] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const destinationPromise = destinationId
      ? api.getPlace(destinationId).catch(() => null)
      : Promise.resolve(null)
      
    const originPromise = originId
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

    return () => { cancelled = true }
  }, [destinationId, originId])

  if (isLoading) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Smart mobility</h1>
        </header>
        <p className="hint-text">Loading route options&hellip;</p>
      </div>
    )
  }

  const bbox = destination
    ? `${destination.lon - 0.01}%2C${destination.lat - 0.008}%2C${destination.lon + 0.01}%2C${destination.lat + 0.008}`
    : '73.83%2C18.50%2C73.87%2C18.54'
  const marker = destination ? `&marker=${destination.lat}%2C${destination.lon}` : ''

  return (
    <div className="page">
      <header className="page-header">
        <h1>Smart mobility</h1>
        
        <div className="stop-card" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}>
            <strong style={{ color: 'var(--basalt)' }}>Starting Destination:</strong> {origin ? origin.name : 'Your Current Location'}
          </div>
          <div style={{ fontSize: '0.95rem' }}>
            <strong style={{ color: 'var(--basalt)' }}>End Destination:</strong> {destination ? destination.name : 'Not selected'}
          </div>
        </div>

        <p className="page-sub">
          Compared on cost, time and walking distance &mdash; not just distance on a map.
        </p>
      </header>

      {!destination && (
        <p className="hint-text">No destination selected. Showing a sample comparison &mdash; open this page from an itinerary stop's "Directions" button for a specific route.</p>
      )}

      {options.length === 0 && destination ? (
        <p className="hint-text">No route data available for this destination yet.</p>
      ) : (
        <div className="route-compare">
          {options.map(opt => {
            const isFastest = opt === options.reduce((a, b) => (a.timeMin < b.timeMin ? a : b));
            const isCheapest = opt === options.reduce((a, b) => (a.costInr < b.costInr ? a : b));
            const isLeastWalking = opt === options.reduce((a, b) => (a.walkingM < b.walkingM ? a : b));

            return (
              <div key={opt.mode} className="route-card">
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
    </div>
  )
}
