import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'

export default function Mobility() {
  const [searchParams] = useSearchParams()
  const destinationId = searchParams.get('to')

  const [destination, setDestination] = useState(null)
  const [options, setOptions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    const destinationPromise = destinationId
      ? api.getPlace(destinationId).catch(() => null)
      : Promise.resolve(null)

    Promise.all([destinationPromise, api.getRoutes(destinationId || undefined).catch(() => [])])
      .then(([place, routes]) => {
        if (cancelled) return
        setDestination(place)
        setOptions(routes)
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [destinationId])

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

  if (options.length === 0) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Smart mobility{destination ? ` to ${destination.name}` : ''}</h1>
        </header>
        <p className="hint-text">No route data available for this destination yet.</p>
      </div>
    )
  }

  const fastest = options.reduce((a, b) => (a.timeMin < b.timeMin ? a : b))
  const cheapest = options.reduce((a, b) => (a.costInr < b.costInr ? a : b))
  const leastWalking = options.reduce((a, b) => (a.walkingM < b.walkingM ? a : b))

  const bbox = destination
    ? `${destination.lon - 0.01}%2C${destination.lat - 0.008}%2C${destination.lon + 0.01}%2C${destination.lat + 0.008}`
    : '73.83%2C18.50%2C73.87%2C18.54'
  const marker = destination ? `&marker=${destination.lat}%2C${destination.lon}` : ''

  return (
    <div className="page">
      <header className="page-header">
        <h1>Smart mobility{destination ? ` to ${destination.name}` : ''}</h1>
        <p className="page-sub">
          Compared on cost, time and walking distance &mdash; not just distance on a map.
        </p>
      </header>

      {!destination && (
        <p className="hint-text">No destination selected. Showing a sample comparison &mdash; open this page from an itinerary stop's "Directions" button for a specific route.</p>
      )}

      <div className="route-compare">
        {options.map(opt => (
          <div key={opt.mode} className="route-card">
            <h3>{opt.mode}</h3>
            <dl className="route-stats">
              <div><dt>Cost</dt><dd>{opt.costInr === 0 ? 'Free' : `₹${opt.costInr}`}</dd></div>
              <div><dt>Time</dt><dd>{opt.timeMin} min</dd></div>
              <div><dt>Walking</dt><dd>{opt.walkingM} m</dd></div>
            </dl>
            <p className="route-notes">{opt.notes}</p>
            <div className="route-badges">
              {opt === fastest && <span className="pill pill-teal">Fastest</span>}
              {opt === cheapest && <span className="pill pill-gold">Cheapest</span>}
              {opt === leastWalking && <span className="pill pill-teal">Least walking</span>}
            </div>
          </div>
        ))}
      </div>

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
