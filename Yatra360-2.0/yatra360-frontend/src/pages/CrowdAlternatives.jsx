import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import DemandTag from '../components/DemandTag'

export default function CrowdAlternatives() {
  const { flaggedForRedistribution, swapPlace, hasPlanned } = useTrip()
  const navigate = useNavigate()

  if (!hasPlanned) {
    return (
      <div className="page">
        <div className="empty-state">
          <h2>No trip planned yet</h2>
          <p>Plan a trip first &mdash; we'll flag any overcrowded stops here automatically.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Start trip profile</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Crowd redistribution</h1>
        <p className="page-sub">
          Estimated demand &mdash; based on historical patterns, day of week and season, not live crowd tracking.
        </p>
      </header>

      {flaggedForRedistribution.length === 0 ? (
        <div className="empty-state">
          <h2>Nothing flagged</h2>
          <p>None of your current itinerary stops show high estimated demand for your dates.</p>
        </div>
      ) : (
        <div className="alt-list">
          {flaggedForRedistribution.map(({ overcrowded, alternative, sharedTag }) => (
            <div key={overcrowded.id} className="alt-pair">
              <div className="alt-card alt-card-crowded">
                <span className="alt-label">Overcrowded</span>
                <h3>{overcrowded.name}</h3>
                <DemandTag level={overcrowded.estimatedDemand} />
                <p>{overcrowded.description}</p>
              </div>

              <div className="alt-arrow" aria-hidden="true">&rarr;</div>

              <div className="alt-card alt-card-alternative">
                <span className="alt-label">Recommended alternative</span>
                <h3>{alternative.name}</h3>
                <DemandTag level={alternative.estimatedDemand} />
                <p>{alternative.description}</p>
                <p className="alt-shared-tag">Why it fits: {sharedTag}</p>
                <button
                  className="btn-primary"
                  onClick={() => swapPlace(overcrowded.id, alternative)}
                >
                  Swap into my itinerary
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
