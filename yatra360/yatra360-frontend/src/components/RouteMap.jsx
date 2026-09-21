import { useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Leaflet's default marker icons are resolved from relative image paths,
 * which break under Vite's bundler. Building the markers as inline
 * divIcons avoids the problem entirely and lets us colour-code the
 * start and end pins to match the app's palette.
 */
function pinIcon(colour, label) {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `
      <span class="map-pin" style="background:${colour}">
        <b>${label}</b>
      </span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -26],
  })
}

const START_ICON = pinIcon('#2C6E63', 'A')
const END_ICON = pinIcon('#B4432E', 'B')

/** Collect every coordinate a route draws, whatever shape it came in. */
function routePoints(route) {
  if (!route) return []
  return [
    ...(route.firstLegGeometry || []),
    ...(route.metroGeometry || []),
    ...(route.lastLegGeometry || []),
    ...(route.geometry || []),
  ]
}

/**
 * Keeps the viewport framed on whatever is currently drawn. Without this
 * the map stays wherever it was first centred and the route can end up
 * off-screen — which was the core of the old map bug.
 */
function FitToRoute({ route, origin, destination }) {
  const map = useMap()

  useEffect(() => {
    const points = [...routePoints(route)]
    if (origin) points.push([origin.lat, origin.lon])
    if (destination) points.push([destination.lat, destination.lon])

    if (points.length === 0) return

    if (points.length === 1) {
      map.setView(points[0], 15)
      return
    }

    map.fitBounds(L.latLngBounds(points), { padding: [45, 45], maxZoom: 16 })
    // Leaflet mis-measures its container when the map mounts inside a
    // panel that is still laying out, so nudge it once on the next frame.
    const t = setTimeout(() => map.invalidateSize(), 120)
    return () => clearTimeout(t)
  }, [route, origin, destination, map])

  return null
}

export default function RouteMap({ route, origin, destination, height = 420 }) {
  const center = useMemo(() => {
    if (origin && destination) {
      return [(origin.lat + destination.lat) / 2, (origin.lon + destination.lon) / 2]
    }
    if (destination) return [destination.lat, destination.lon]
    if (origin) return [origin.lat, origin.lon]
    return [18.5204, 73.8567] // central Pune
  }, [origin, destination])

  const isMetro = Boolean(route?.metroGeometry)

  return (
    <div className="map-embed" style={{ height }}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitToRoute route={route} origin={origin} destination={destination} />

        {isMetro ? (
          <>
            <Polyline
              positions={route.firstLegGeometry || []}
              pathOptions={{ color: '#2C6E63', weight: 5, opacity: 0.9 }}
            />
            <Polyline
              positions={route.metroGeometry || []}
              pathOptions={{ color: '#B4432E', weight: 6, opacity: 0.95, dashArray: '10 8' }}
            />
            <Polyline
              positions={route.lastLegGeometry || []}
              pathOptions={{ color: '#2C6E63', weight: 5, opacity: 0.9 }}
            />
          </>
        ) : (
          route?.geometry && (
            <>
              {/* A wider pale stroke under the line keeps it legible over
                  dense map tiles. */}
              <Polyline
                positions={route.geometry}
                pathOptions={{ color: '#F7F8F3', weight: 9, opacity: 0.85 }}
              />
              <Polyline
                positions={route.geometry}
                pathOptions={{ color: '#2C6E63', weight: 5, opacity: 0.95 }}
              />
            </>
          )
        )}

        {origin && (
          <Marker position={[origin.lat, origin.lon]} icon={START_ICON}>
            <Popup>
              <strong>Start</strong>
              <br />
              {origin.name}
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lon]} icon={END_ICON}>
            <Popup>
              <strong>Destination</strong>
              <br />
              {destination.name}
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {isMetro && (
        <div className="map-legend">
          <span><i className="map-legend-swatch" style={{ background: '#2C6E63' }} /> Feeder leg</span>
          <span><i className="map-legend-swatch map-legend-dashed" /> Metro</span>
        </div>
      )}
    </div>
  )
}
