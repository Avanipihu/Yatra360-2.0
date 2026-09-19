import { Link, useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import { HOTELS } from '../data/mockData'
import DemandTag from '../components/DemandTag'

export default function Itinerary() {
  const { profile, itinerary, hasPlanned } = useTrip()
  const navigate = useNavigate()

  if (!hasPlanned) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>No trip planned yet</h2>
          <p>Tell us about your trip first and we'll generate a day-by-day plan.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Start trip profile</button>
        </div>
      </div>
    )
  }

  const hotel = HOTELS.find(h => h.id === profile.selectedHotelId)

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your {profile.days}-day plan for {profile.destination}</h1>
        <p className="page-sub">
          Built for {profile.groupType.toLowerCase()} travel &middot; {profile.budget.toLowerCase()} budget
          {profile.interests.length > 0 && <> &middot; {profile.interests.join(', ')}</>}
        </p>
      </header>

      {profile.needsHotel && (
        <div className="hotel-banner">
          {hotel ? (
            <p><strong>Staying at:</strong> {hotel.name}, {hotel.area} &middot; ₹{hotel.pricePerNight.toLocaleString('en-IN')}/night</p>
          ) : (
            <p>Hotel needed &mdash; no specific option selected yet.</p>
          )}
        </div>
      )}

      {itinerary.map(day => (
        <section key={day.dayNumber} className="day-block">
          <h2 className="day-title">Day {day.dayNumber}</h2>
          <ol className="route-line">
            {day.stops.map(stop => (
              <li key={stop.id} className="route-stop">
                <span className="route-marker" aria-hidden="true" />
                <div className="stop-card">
                  <div className="stop-card-head">
                    <h3>{stop.name}</h3>
                    <DemandTag level={stop.estimatedDemand} />
                  </div>
                  <p className="stop-desc">{stop.description}</p>
                  <div className="stop-meta">
                    <span>{stop.openHours}</span>
                    <span>{stop.cost === 'Free' ? 'Free entry' : `${stop.cost} cost`}</span>
                    <span>{stop.category}</span>
                  </div>
                  <div className="stop-actions">
                    <Link to={`/mobility?to=${stop.id}`} className="btn-secondary">
                      Directions &rarr;
                    </Link>
                    {stop.estimatedDemand === 'High' && (
                      <Link to="/crowd" className="btn-ghost">See a quieter alternative</Link>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}
