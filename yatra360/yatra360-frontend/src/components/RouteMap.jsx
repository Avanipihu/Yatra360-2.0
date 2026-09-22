import { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

function MapUpdater({ route, origin, destination }) {
  const map = useMap()
  useEffect(() => {
    const points = []
    if (origin?.lat && origin?.lon) points.push([origin.lat, origin.lon])
    if (destination?.lat && destination?.lon) points.push([destination.lat, destination.lon])
    if (route?.geometry) points.push(...route.geometry)
    if (route?.firstLegGeometry) points.push(...route.firstLegGeometry)
    if (route?.lastLegGeometry) points.push(...route.lastLegGeometry)
    if (route?.metroGeometry) points.push(...route.metroGeometry)

    if (points.length > 0) {
      try {
        map.fitBounds(points, { padding: [40, 40] })
      } catch {
        // Safe bounds fallback
      }
    }
  }, [route, origin, destination, map])
  return null
}

export default function RouteMap({ route, origin, destination }) {
  const defaultCenter = destination?.lat && destination?.lon
    ? [destination.lat, destination.lon]
    : origin?.lat && origin?.lon
    ? [origin.lat, origin.lon]
    : [18.52, 73.85]

  return (
    <div className="map-embed" style={{ height: '400px', width: '100%', borderRadius: '6px', overflow: 'hidden', marginTop: '1rem' }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater route={route} origin={origin} destination={destination} />

        {origin?.lat && origin?.lon && (
          <Marker position={[origin.lat, origin.lon]}>
            <Popup><strong>Start:</strong> {origin.name || 'Origin'}</Popup>
          </Marker>
        )}

        {destination?.lat && destination?.lon && (
          <Marker position={[destination.lat, destination.lon]}>
            <Popup><strong>Destination:</strong> {destination.name || 'Destination'}</Popup>
          </Marker>
        )}

        {route?.stations && route.stations.map((st, idx) => (
          <Marker key={`st-${idx}`} position={[st.lat, st.lon]}>
            <Popup><strong>Transit Stop:</strong> {st.name}</Popup>
          </Marker>
        ))}

        {route?.metroGeometry ? (
          <>
            {route.firstLegGeometry && (
              <Polyline positions={route.firstLegGeometry} pathOptions={{ color: 'var(--teal)', weight: 4, dashArray: '4, 8' }} />
            )}
            <Polyline positions={route.metroGeometry} pathOptions={{ color: 'var(--brick)', weight: 6 }} />
            {route.lastLegGeometry && (
              <Polyline positions={route.lastLegGeometry} pathOptions={{ color: 'var(--teal)', weight: 4, dashArray: '4, 8' }} />
            )}
          </>
        ) : (
          route?.geometry && (
            <Polyline positions={route.geometry} pathOptions={{ color: 'var(--teal)', weight: 5 }} />
          )
        )}
      </MapContainer>
    </div>
  )
}
