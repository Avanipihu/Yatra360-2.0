import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../services/api'
import RouteMap from '../components/RouteMap'

/**
 * Transit & Routes.
 *
 * Start and destination come from the backend's Pune location catalogue,
 * grouped into optgroups, so the dropdown and the routing engine can
 * never disagree about what is selectable.
 */
export default function Mobility() {
  const [searchParams, setSearchParams] = useSearchParams()
  const originParam = searchParams.get('from') || ''
  const destinationParam = searchParams.get('to') || ''

  const [groups, setGroups] = useState([])
  const [fromInput, setFromInput] = useState(originParam)
  const [toInput, setToInput] = useState(destinationParam)

  const [origin, setOrigin] = useState(null)
  const [destination, setDestination] = useState(null)
  const [options, setOptions] = useState([])
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [distanceKm, setDistanceKm] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Location catalogue for the dropdowns.
  useEffect(() => {
    let cancelled = false
    api.getLocations()
      .then(data => { if (!cancelled) setGroups(data) })
      .catch(() => { if (!cancelled) setGroups([]) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setFromInput(originParam)
    setToInput(destinationParam)
  }, [originParam, destinationParam])

  const allNames = useMemo(
    () => groups.flatMap(g => g.locations.map(l => l.name)),
    [groups]
  )

  // Fetch and compare routes whenever both ends are known.
  useEffect(() => {
    let cancelled = false

    if (!originParam || !destinationParam) {
      setOptions([])
      setSelectedRoute(null)
      setDistanceKm(null)
      setOrigin(originParam ? { name: originParam } : null)
      // A "Directions" link from the itinerary arrives with only a
      // destination, so show that pin on its own rather than nothing.
      if (destinationParam) {
        api.getPlace(destinationParam)
          .then(place => { if (!cancelled) setDestination(place) })
          .catch(() => { if (!cancelled) setDestination({ name: destinationParam }) })
      } else {
        setDestination(null)
      }
      return () => { cancelled = true }
    }

    setIsLoading(true)
    setError(null)
    setSelectedRoute(null)

    api.compareRoutes(originParam, destinationParam)
      .then(data => {
        if (cancelled) return
        setOrigin({ name: data.origin, lat: data.originCoordinates.lat, lon: data.originCoordinates.lon })
        setDestination({
          name: data.destination,
          lat: data.destinationCoordinates.lat,
          lon: data.destinationCoordinates.lon,
        })
        setDistanceKm(data.distanceKm)

        const mapped = data.routes.map((r, i) => ({
          id: `${r.type}-${i}`,
          mode: r.type,
          costInr: r.cost,
          timeMin: r.time,
          walkingM: r.walking,
          notes: r.description,
          geometry: r.geometry,
          firstLegGeometry: r.firstLegGeometry,
          metroGeometry: r.metroGeometry,
          lastLegGeometry: r.lastLegGeometry,
        }))
        setOptions(mapped)
        setSelectedRoute(mapped[0] || null)
      })
      .catch(err => {
        if (cancelled) return
        setError(err.message || 'Could not work out a route between those points.')
        setOptions([])
        setOrigin({ name: originParam })
        setDestination({ name: destinationParam })
      })
      .finally(() => { if (!cancelled) setIsLoading(false) })

    return () => { cancelled = true }
  }, [originParam, destinationParam])

  function handleSearch(e) {
    e.preventDefault()
    if (!fromInput || !toInput) return
    if (fromInput === toInput) {
      setError('Pick two different places.')
      return
    }
    setSearchParams({ from: fromInput, to: toInput })
  }

  function swapEnds() {
    setFromInput(toInput)
    setToInput(fromInput)
    if (originParam && destinationParam) {
      setSearchParams({ from: destinationParam, to: originParam })
    }
  }

  // Badge winners, computed once so the cards don't each re-scan the list.
  const best = useMemo(() => {
    if (options.length === 0) return {}
    const by = (key) => options.reduce((a, b) => (b[key] < a[key] ? b : a)).id
    return { fastest: by('timeMin'), cheapest: by('costInr'), leastWalking: by('walkingM') }
  }, [options])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Transit &amp; Routes</h1>
        <p className="page-sub">
          Every sensible way to make the journey, compared on what you pay, how long it
          takes and how far you walk.
        </p>
      </header>

      <form className="route-form" onSubmit={handleSearch}>
        <div className="route-form-row">
          <label>
            Starting location
            <select value={fromInput} onChange={e => setFromInput(e.target.value)} required>
              <option value="" disabled>Select a starting point</option>
              {fromInput && allNames.length > 0 && !allNames.includes(fromInput) && (
                <option value={fromInput}>{fromInput}</option>
              )}
              {groups.map(g => (
                <optgroup key={g.group} label={g.group}>
                  {g.locations.map(l => (
                    <option key={`from-${l.name}`} value={l.name}>{l.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          <button
            type="button"
            className="route-swap"
            onClick={swapEnds}
            title="Swap start and destination"
            aria-label="Swap start and destination"
          >
            &#8646;
          </button>

          <label>
            Destination
            <select value={toInput} onChange={e => setToInput(e.target.value)} required>
              <option value="" disabled>Select a destination</option>
              {toInput && allNames.length > 0 && !allNames.includes(toInput) && (
                <option value={toInput}>{toInput}</option>
              )}
              {groups.map(g => (
                <optgroup key={g.group} label={g.group}>
                  {g.locations.map(l => (
                    <option key={`to-${l.name}`} value={l.name}>{l.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div className="route-form-actions">
          <button type="submit" className="btn-primary">Compare routes</button>
          {groups.length === 0 && (
            <span className="hint-text">Loading Pune locations&hellip;</span>
          )}
        </div>
      </form>

      {error && <p className="form-error">{error}</p>}

      {(origin || destination) && (
        <div className="route-ends">
          <div>
            <span className="route-end-pin route-end-pin-a">A</span>
            <div>
              <span className="route-end-label">Start</span>
              <strong>{origin?.name || 'Not selected'}</strong>
            </div>
          </div>
          <div>
            <span className="route-end-pin route-end-pin-b">B</span>
            <div>
              <span className="route-end-label">Destination</span>
              <strong>{destination?.name || 'Not selected'}</strong>
            </div>
          </div>
          {distanceKm !== null && (
            <div className="route-end-distance">
              <span className="route-end-label">Direct distance</span>
              <strong>{distanceKm} km</strong>
            </div>
          )}
        </div>
      )}

      {isLoading && <p className="hint-text">Working out your options&hellip;</p>}

      {!isLoading && options.length > 0 && (
        <>
          <p className="hint-text route-hint">
            Select an option to draw it on the map.
          </p>
          <div className="route-compare">
            {options.map(opt => {
              const isSelected = selectedRoute?.id === opt.id
              return (
                <button
                  type="button"
                  key={opt.id}
                  className={'route-card' + (isSelected ? ' route-card-selected' : '')}
                  onClick={() => setSelectedRoute(opt)}
                  aria-pressed={isSelected}
                >
                  <h3>{opt.mode}</h3>
                  <dl className="route-stats">
                    <div><dt>Cost</dt><dd>{opt.costInr === 0 ? 'Free' : `\u20B9${opt.costInr}`}</dd></div>
                    <div><dt>Time</dt><dd>{opt.timeMin} min</dd></div>
                    <div><dt>Walking</dt><dd>{opt.walkingM} m</dd></div>
                  </dl>
                  <p className="route-notes">{opt.notes}</p>
                  <div className="route-badges">
                    {best.fastest === opt.id && <span className="pill pill-teal">Fastest</span>}
                    {best.cheapest === opt.id && <span className="pill pill-gold">Cheapest</span>}
                    {best.leastWalking === opt.id && <span className="pill pill-teal">Least walking</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {!isLoading && !error && options.length === 0 && (
        <p className="hint-text">
          {destination && !origin
            ? `Showing ${destination.name}. Pick a starting point above to compare routes to it.`
            : 'Choose a starting point and a destination, then select Compare routes.'}
        </p>
      )}

      <RouteMap route={selectedRoute} origin={origin} destination={destination} />

      <p className="source-note">
        Route lines are modelled estimates, not turn-by-turn navigation. Metro legs follow
        the real Aqua and Purple line alignments.
      </p>
    </div>
  )
}
