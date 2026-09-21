import { useEffect, useState } from 'react'
import { api } from '../services/api'
import PlacePhoto from './PlacePhoto'

/**
 * Locals' Favourites — cafes, sweet shops and street-food stalls that
 * registered themselves through the business console.
 *
 * These are owner-submitted listings, which is the whole point: this is
 * where a visitor finds the place four generations of one family have run,
 * rather than the chain with the biggest ad budget.
 */
export default function LocalFavourites({ limit = 6, title = "Locals' favourites" }) {
  const [businesses, setBusinesses] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api.getLocalsFavourites(limit)
      .then(data => { if (!cancelled) setBusinesses(data) })
      .catch(() => { if (!cancelled) setBusinesses([]) })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [limit])

  if (isLoading) return <p className="hint-text">Loading local favourites&hellip;</p>
  if (businesses.length === 0) return null

  return (
    <section className="locals-section">
      <header className="locals-head">
        <div>
          <h2>{title}</h2>
          <p className="page-sub">
            Owner-run Pune food spots, listed by the people who run them.
          </p>
        </div>
        <span className="locals-count">{businesses.length} listed</span>
      </header>

      <div className="locals-grid">
        {businesses.map(b => (
          <article
            key={b.id}
            className="locals-card"
            // Counting the impression here is what populates the
            // "profile views" figure in the owner's analytics tab.
            onMouseEnter={() => api.recordBusinessView(b.id, 'itinerary')}
          >
            <PlacePhoto src={b.imageUrl} name={b.name} ratio="4 / 3">
              {b.isVerified && <span className="locals-verified">Verified local</span>}
            </PlacePhoto>

            <div className="locals-card-body">
              <h3>{b.name}</h3>
              <p className="locals-meta">
                {[b.cuisine, b.locality].filter(Boolean).join(' \u00B7 ')}
              </p>
              {b.tagline && <p className="locals-tagline">{b.tagline}</p>}
              {b.signatureItem && (
                <p className="locals-signature">
                  <span>Known for</span> {b.signatureItem}
                </p>
              )}
              <div className="locals-footer">
                <span className="locals-rating">&#9733; {b.rating?.toFixed(1)}</span>
                <span className="locals-hours">{b.hours}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
