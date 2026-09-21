import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDashboard } from '../useDashboard'
import { StackedHourlyChart, CrowdBar } from '../components/MiniChart'
import OpportunityCard from '../components/OpportunityCard'

const RADIUS_CHOICES = [1.5, 2.5, 5]

export default function CrowdDashboard() {
  const [radius, setRadius] = useState(2.5)
  const { data, error, isLoading, actOnOpportunity, clearOpportunity } = useDashboard(radius)

  if (isLoading && !data) return <div className="biz-boot">Loading your radius&hellip;</div>

  if (error && !data) {
    return (
      <div className="biz-boot biz-boot-error">
        <h2>Couldn't load your dashboard</h2>
        <p>{error}</p>
      </div>
    )
  }

  const { attractions, forecast, opportunities, alerts, segments, business } = data
  const topOpportunity = opportunities[0]
  const busyCount = attractions.filter(a => a.crowdIndex >= 0.55).length

  return (
    <div className="biz-page">
      <header className="biz-page-head">
        <div>
          <h1>Crowd &amp; opportunity</h1>
          <p>
            What's happening around {business.name} right now, and what it means for the
            next few hours.
          </p>
        </div>

        <div className="biz-radius" role="group" aria-label="Demand radius">
          {RADIUS_CHOICES.map(r => (
            <button
              key={r}
              aria-pressed={radius === r}
              onClick={() => setRadius(r)}
              className={radius === r ? 'biz-radius-on' : ''}
            >
              {r} km
            </button>
          ))}
        </div>
      </header>

      {/* ---- Headline numbers ---- */}
      <div className="biz-ledger">
        <div>
          <span>Attractions in radius</span>
          <b>{attractions.length}</b>
          <i>{busyCount} busy right now</i>
        </div>
        <div>
          <span>Projected footfall today</span>
          <b>{forecast.total?.toLocaleString('en-IN')}</b>
          <i>across your {radius} km radius</i>
        </div>
        <div>
          <span>Your peak window</span>
          <b>{forecast.peakWindow}</b>
          <i>{forecast.peakArrivals?.toLocaleString('en-IN')} arrivals at peak</i>
        </div>
        <div className={forecast.capacityPressure > 1 ? 'biz-ledger-warn' : ''}>
          <span>Reachable at peak</span>
          <b>{forecast.captureEstimate}</b>
          <i>
            against {business.capacity || 0} {business.capacityUnit}
            {forecast.capacityPressure > 1 ? ' \u2014 over capacity' : ''}
          </i>
        </div>
      </div>

      <div className="biz-sheet">
        <div className="biz-col">

          {/* ---- Nearby crowd levels ---- */}
          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Crowd levels near you</h3>
              <span className="biz-label">LIVE ESTIMATE</span>
            </div>
            <p className="biz-note">
              How busy each nearby attraction is at this hour. A crowded site next door is
              overflow you can catch; a quiet one is a redistribution route you can get
              listed on.
            </p>

            {attractions.length === 0 ? (
              <p className="biz-note">
                Nothing mapped inside {radius} km. Try a wider radius, or check the locality
                on your listing.
              </p>
            ) : (
              <table className="biz-table">
                <thead>
                  <tr>
                    <th>Attraction</th>
                    <th>Distance</th>
                    <th style={{ width: '30%' }}>Crowd now</th>
                    <th>Peaks at</th>
                  </tr>
                </thead>
                <tbody>
                  {attractions.map(a => (
                    <tr key={a.placeId}>
                      <td>
                        <strong>{a.name}</strong>
                        <span className="biz-table-sub">{a.category}</span>
                      </td>
                      <td>{a.distanceKm} km</td>
                      <td>
                        <CrowdBar value={a.crowdIndex} level={a.crowdLevel} />
                        <span className="biz-table-sub">{a.crowdLevel}</span>
                      </td>
                      <td>{String(a.peakHour).padStart(2, '0')}:00</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* ---- Footfall forecast ---- */}
          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Hourly footfall forecast</h3>
              <span className="biz-label">BY SEGMENT</span>
            </div>
            <p className="biz-note">
              Projected arrivals inside your radius, split by who they are. The tall bars are
              the window worth staffing.
            </p>

            <div className="biz-legend">
              {Object.entries(segments).map(([key, meta]) => (
                <span key={key}>
                  <i className="biz-swatch" style={{ background: meta.hex }} />
                  {meta.name}
                </span>
              ))}
            </div>

            <StackedHourlyChart series={forecast.series} segments={segments} />
          </section>
        </div>

        <div className="biz-col">

          {/* ---- Top opportunity ---- */}
          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Do this next</h3>
            </div>
            {topOpportunity ? (
              <>
                <OpportunityCard
                  opportunity={topOpportunity}
                  onAct={actOnOpportunity}
                  onClear={clearOpportunity}
                />
                <Link className="biz-btn biz-btn-ghost biz-btn-block" to="/business/app/opportunities">
                  See all {opportunities.length} prompts &rarr;
                </Link>
              </>
            ) : (
              <p className="biz-note">Nothing pressing right now. Check back closer to your peak window.</p>
            )}
          </section>

          {/* ---- Alerts ---- */}
          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Alerts on your block</h3>
              <span className="biz-label">LIVE</span>
            </div>
            {alerts.map((a, i) => (
              <div className="biz-alert" key={`${a.title}-${i}`}>
                <time>{a.at}</time>
                <div>
                  <div className="biz-alert-title">
                    <span className={`biz-sev biz-sev-${a.severity}`} />
                    {a.title}
                  </div>
                  <div className="biz-alert-sub">{a.detail}</div>
                </div>
              </div>
            ))}
          </section>
        </div>
      </div>

      <p className="biz-source-note">
        Crowd levels are modelled from historical demand, day of week and time of day &mdash;
        not live device tracking.
      </p>
    </div>
  )
}
