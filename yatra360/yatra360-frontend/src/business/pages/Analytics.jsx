import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import { Sparkline, BarRow } from '../components/MiniChart'

const SOURCE_LABEL = {
  listing: 'Stay picker',
  itinerary: "Locals' favourites",
  alternative: 'Quieter alternatives',
  search: 'Search',
}

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.business.analytics()
      .then(data => { if (!cancelled) setStats(data) })
      .catch(err => { if (!cancelled) setError(err.message || 'Could not load your analytics.') })
    return () => { cancelled = true }
  }, [])

  if (error) {
    return (
      <div className="biz-boot biz-boot-error">
        <h2>Couldn't load your analytics</h2>
        <p>{error}</p>
      </div>
    )
  }
  if (!stats) return <div className="biz-boot">Loading your numbers&hellip;</div>

  const dayPoints = stats.byDay.map(d => d.views)
  const maxSource = Math.max(...stats.bySource.map(s => s.views), 1)
  const maxHour = Math.max(...stats.byHour.map(h => h.views), 1)
  const peakViewHour = stats.peakViewHour

  return (
    <div className="biz-page">
      <header className="biz-page-head">
        <div>
          <h1>Analytics</h1>
          <p>How often tourists are seeing your listing, where from, and when demand peaks.</p>
        </div>
      </header>

      <div className="biz-ledger">
        <div>
          <span>Profile views</span>
          <b>{stats.totalViews.toLocaleString('en-IN')}</b>
          <i>all time</i>
        </div>
        <div>
          <span>Peak demand window</span>
          <b>{stats.peakDemandWindow || '\u2014'}</b>
          <i>busiest hours in your radius</i>
        </div>
        <div>
          <span>Projected daily footfall</span>
          <b>{stats.projectedDailyFootfall?.toLocaleString('en-IN')}</b>
          <i>tourists passing nearby</i>
        </div>
        <div>
          <span>Reachable at peak</span>
          <b>{stats.reachableAtPeak}</b>
          <i>realistic walk-in ceiling</i>
        </div>
      </div>

      <div className="biz-sheet">
        <div className="biz-col">
          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Profile views over time</h3>
              <span className="biz-label">LAST {stats.byDay.length} DAYS</span>
            </div>
            {dayPoints.length === 0 ? (
              <p className="biz-note">
                No views recorded yet. Views are counted when a tourist sees your card in the
                stay picker or in Locals' Favourites.
              </p>
            ) : (
              <>
                <Sparkline points={dayPoints} />
                <div className="biz-chart-axis">
                  {stats.byDay.filter((_, i) => i % 3 === 0).map(d => (
                    <span key={d.date}>{d.date.slice(5)}</span>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Views by hour of day</h3>
              <span className="biz-label">WHEN THEY LOOK</span>
            </div>
            <p className="biz-note">
              {peakViewHour !== null && peakViewHour !== undefined
                ? `Most people look you up around ${String(peakViewHour).padStart(2, '0')}:00. That is when your photos and hours need to be right.`
                : 'Not enough data yet to find a pattern.'}
            </p>
            <div className="biz-hourgrid">
              {stats.byHour.map(h => (
                <div key={h.hour} className="biz-hourbar" title={`${h.hour}:00 \u2014 ${h.views} views`}>
                  <i style={{ height: `${Math.round((h.views / maxHour) * 100)}%` }} />
                  {h.hour % 6 === 0 && <span>{String(h.hour).padStart(2, '0')}</span>}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="biz-col">
          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>Where views come from</h3>
            </div>
            {stats.bySource.length === 0 ? (
              <p className="biz-note">No traffic sources recorded yet.</p>
            ) : (
              stats.bySource.map(s => (
                <BarRow
                  key={s.source}
                  label={SOURCE_LABEL[s.source] || s.source}
                  value={s.views}
                  max={maxSource}
                />
              ))
            )}
          </section>

          <section className="biz-mod">
            <div className="biz-mod-head">
              <h3>What to do with this</h3>
            </div>
            <p className="biz-note">
              Views tell you whether tourists are finding you. The peak demand window tells you
              whether you're open when they're nearby. When the two don't line up, the fix is
              usually your hours, not your prices.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
