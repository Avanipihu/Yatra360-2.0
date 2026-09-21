import { Link, useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import DemandTag from '../components/DemandTag'
import PlacePhoto from '../components/PlacePhoto'
import LocalFavourites from '../components/LocalFavourites'

export default function Itinerary() {
  const { profile, itinerary, hasPlanned, isGenerating, generateError, hotels } = useTrip()
  const navigate = useNavigate()

  if (isGenerating) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Building your itinerary&hellip;</h2>
          <p>Matching places to your interests, group type and budget.</p>
        </div>
      </div>
    )
  }

  if (generateError) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>Couldn't generate your itinerary</h2>
          <p>{generateError}</p>
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>Try again</button>
        </div>
      </div>
    )
  }

  if (!hasPlanned) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>No trip planned yet</h2>
          <p>Tell us about your trip first and we'll generate a day-by-day plan.</p>
          <button className="btn-primary" onClick={() => navigate('/onboarding')}>Start trip profile</button>
        </div>
      </div>
    )
  }

  const hotel = hotels.find(h => h.id === profile.selectedHotelId)
  // Routes start from the hotel when there is one, so "Directions" gives a
  // real journey rather than an unanchored destination pin.
  const routeOrigin = hotel?.area || hotel?.name || ''

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
            <p>
              <strong>Staying at:</strong> {hotel.name}, {hotel.area} &middot;{' '}
              &#8377;{hotel.pricePerNight.toLocaleString('en-IN')}/night
              {hotel.isLocal && <span className="pill pill-teal hotel-banner-pill">Local &amp; owner-run</span>}
            </p>
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
                <div className="stop-card stop-card-photo">
                  <PlacePhoto
                    src={stop.imageUrl}
                    name={stop.name}
                    credit={stop.imageCredit}
                    ratio="16 / 9"
                    className="stop-photo"
                  />

                  <div className="stop-card-content">
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
                      <Link
                        to={`/mobility?to=${encodeURIComponent(stop.name)}${routeOrigin ? `&from=${encodeURIComponent(routeOrigin)}` : ''}`}
                        className="btn-secondary"
                      >
                        Directions &rarr;
                      </Link>
                      {stop.estimatedDemand === 'High' && (
                        <Link to="/crowd" className="btn-ghost">See a quieter alternative</Link>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}

      <LocalFavourites limit={6} />
    </div>
  )
}
