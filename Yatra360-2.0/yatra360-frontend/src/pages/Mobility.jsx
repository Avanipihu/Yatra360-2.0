import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const PUNE_LOCATIONS = [
  "Aga Khan Palace", "Akurdi", "Amanora Park Town", "Aundh", "Bal Gandharva", "Balewadi", "Baner",
  "Bavdhan", "Bibwewadi", "Camp", "Chinchwad", "Dagdusheth Halwai Temple", "Deccan",
  "FC Road", "Hadapsar", "Hinjewadi", "JM Road", "Kalyani Nagar", "Khadakwasla",
  "Kharadi", "Kondhwa", "Koregaon Park", "Kothrud", "Lal Mahal", "Magarpatta",
  "Osho Teerth Park", "Parvati", "Pashan", "Pashan Lake", "Pataleshwar", "Phlox Local Thali House",
  "Pimpri", "Pune Airport", "Pune Railway Station", "Pune University", "Shaniwar Wada",
  "Shivajinagar", "Sinhagad Fort", "Swargate", "Tulshibaug Ram Mandir & Market", "Viman Nagar",
  "Wakad", "Wanowrie", "Yerawada"
];

function RouteBounds({ route }) {
  const map = useMap()
  useEffect(() => {
    if (route && route.geometry && route.geometry.length > 0) {
      map.fitBounds(route.geometry, { padding: [30, 30] })
    }
  }, [route, map])
  return null
}

export default function Mobility() {
  const [searchParams, setSearchParams] = useSearchParams()
  const destinationId = searchParams.get('to') || ''
  const originId = searchParams.get('from') || ''

  const [destination, setDestination] = useState(null)
  const [origin, setOrigin] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const [fromInput, setFromInput] = useState(originId)
  const [toInput, setToInput] = useState(destinationId)

  useEffect(() => {
    setFromInput(originId)
    setToInput(destinationId)
  }, [originId, destinationId])

  useEffect(() => {
    let cancelled = false
    if (!destinationId && !originId) return

    setIsLoading(true)
    setSelectedRoute(null)

    if (originId && destinationId && originId !== 'current') {
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
        
        const mappedOptions = data.routes.map(r => ({
          mode: r.type,
          costInr: r.cost,
          timeMin: r.time,
          walkingM: r.walking,
          notes: r.description,
          geometry: r.geometry,
          firstLegGeometry: r.first_leg_geometry,
          metroGeometry: r.metro_geometry,
          lastLegGeometry: r.last_leg_geometry
        }))
        setOptions(mappedOptions)
        if (mappedOptions.length > 0) setSelectedRoute(mappedOptions[0])
      })
      .catch(err => {
        console.error(err)
        if (!cancelled) {
          setOrigin({ name: originId })
          setDestination({ name: destinationId })
          setOptions([])
        }
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    } else if (destinationId && !originId) {
      api.getPlace(destinationId).then(endPlace => {
        if (cancelled) return
        setDestination(endPlace)
        setOrigin(null)
        setOptions([])
      }).finally(() => { if (!cancelled) setIsLoading(false) })
    } else {
      setIsLoading(false)
    }

    return () => { cancelled = true }
  }, [destinationId, originId])

  const handleSearch = (e) => {
    e.preventDefault()
    if (fromInput.trim() && toInput.trim()) {
      setSearchParams({ from: fromInput.trim(), to: toInput.trim() })
    }
  }

  const defaultCenter = destination ? [destination.lat, destination.lon] : [18.52, 73.85]

  return (
    <div className="page">
      <header className="page-header">
        <h1>Transit & Routes</h1>
        <p className="page-sub">
          Compared on cost, time and walking distance &mdash; not just distance on a map.
        </p>
      </header>

      <form onSubmit={handleSearch} className="profile-form" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'var(--paper-raised)', border: '1px solid var(--basalt-20)', borderRadius: '4px' }}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Plan a specific route</h2>
        <div className="form-row">
          <label>
            Starting Location
            <select 
              value={fromInput} 
              onChange={e => setFromInput(e.target.value)} 
              required
            >
              <option value="" disabled>Select starting location</option>
              {fromInput && !PUNE_LOCATIONS.includes(fromInput) && (
                <option value={fromInput}>{fromInput}</option>
              )}
              {PUNE_LOCATIONS.map(loc => (
                <option key={`from-${loc}`} value={loc}>{loc}</option>
              ))}
            </select>
          </label>
          <label>
            End Destination
            <select 
              value={toInput} 
              onChange={e => setToInput(e.target.value)} 
              required
            >
              <option value="" disabled>Select destination</option>
              {toInput && !PUNE_LOCATIONS.includes(toInput) && (
                <option value={toInput}>{toInput}</option>
              )}
              {PUNE_LOCATIONS.map(loc => (
                <option key={`to-${loc}`} value={loc}>{loc}</option>
              ))}
            </select>
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
                <strong style={{ color: 'var(--basalt)' }}>Starting Destination:</strong> {origin ? origin.name : 'Awaiting input...'}
              </div>
              <div style={{ fontSize: '0.95rem' }}>
                <strong style={{ color: 'var(--basalt)' }}>End Destination:</strong> {destination ? destination.name : 'Not selected'}
              </div>
            </div>
          )}

          {!destination && !originId && (
            <p className="hint-text">No destination selected. Enter your locations above or open this page from an itinerary stop's "Directions" button.</p>
          )}

          {destination && !originId && (
            <p className="hint-text">Please enter a starting location above to view route options to {destination.name}.</p>
          )}

          {options.length === 0 && (destinationId && originId) ? (
            <p className="hint-text">No route data available for these locations yet. Please try another search.</p>
          ) : options.length > 0 && (
            <div className="route-compare">
              {options.map((opt, index) => {
                const isFastest = opt === options.reduce((a, b) => (a.timeMin < b.timeMin ? a : b), options[0]);
                const isCheapest = opt === options.reduce((a, b) => (a.costInr < b.costInr ? a : b), options[0]);
                const isLeastWalking = opt === options.reduce((a, b) => (a.walkingM < b.walkingM ? a : b), options[0]);
                const isSelected = selectedRoute === opt;

                return (
                  <div 
                    key={opt.mode || index} 
                    className="route-card"
                    onClick={() => setSelectedRoute(opt)}
                    style={{ 
                      cursor: 'pointer', 
                      borderColor: isSelected ? 'var(--gold)' : 'var(--basalt-20)',
                      boxShadow: isSelected ? '0 0 0 1px var(--gold)' : 'none',
                      transition: 'all 0.2s'
                    }}
                  >
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

          <div className="map-embed" style={{ height: '350px', position: 'relative' }}>
            <MapContainer 
              center={defaultCenter} 
              zoom={13} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {selectedRoute && (
                <>
                  <RouteBounds route={selectedRoute} />
                  
                  {selectedRoute.metroGeometry ? (
                    <>
                      <Polyline positions={selectedRoute.firstLegGeometry} pathOptions={{ color: 'var(--teal)', weight: 5 }} />
                      <Polyline positions={selectedRoute.metroGeometry} pathOptions={{ color: 'var(--brick)', weight: 5, dashArray: '5, 10' }} />
                      <Polyline positions={selectedRoute.lastLegGeometry} pathOptions={{ color: 'var(--teal)', weight: 5 }} />
                    </>
                  ) : (
                    selectedRoute.geometry && (
                      <Polyline positions={selectedRoute.geometry} pathOptions={{ color: 'var(--teal)', weight: 5 }} />
                    )
                  )}
                </>
              )}
            </MapContainer>
          </div>
        </>
      )}
    </div>
  )
}
