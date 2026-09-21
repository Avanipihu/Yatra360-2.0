import { useEffect, useState } from 'react'
import { CITY_REPORT_TYPES } from '../constants'
import { api } from '../services/api'

const AVAILABILITY_WIDTH = { Low: '25%', Moderate: '60%', High: '90%' }

export default function CityReports() {
  const [reports, setReports] = useState([])
  const [parkingSpots, setParkingSpots] = useState([])
  const [form, setForm] = useState({ type: CITY_REPORT_TYPES[0], location: '', note: '', hasPhoto: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    api.getParkingSpots().then(setParkingSpots).catch(() => setParkingSpots([]))
    api.getReports().then(setReports).catch(() => setReports([]))
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.location.trim()) return
    setIsSubmitting(true)
    try {
      const created = await api.createReport(form)
      setReports(r => [created, ...r])
      setForm({ type: CITY_REPORT_TYPES[0], location: '', note: '', hasPhoto: false })
    } catch {
      // Keep the form filled in so the user can retry submitting.
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate Pune P1/P2 rule based on current date
  const today = new Date().getDate()
  const isOdd = today % 2 !== 0
  const ordinal = [1, 21, 31].includes(today) ? 'st' : [2, 22].includes(today) ? 'nd' : [3, 23].includes(today) ? 'rd' : 'th'

  return (
    <div className="page">
      <header className="page-header">
        <h1>City Alerts & Parking</h1>
        <p className="page-sub">Crowdsourced issue reporting and parking intelligence near tourist areas.</p>
      </header>

      <section>
        <h2 className="section-title">Report an issue</h2>
        <form className="report-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Issue type
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {CITY_REPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </label>
            <label>
              Location
              <input
                type="text"
                placeholder="e.g. near Shaniwar Wada east gate"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
            </label>
          </div>
          <label>
            Notes (optional)
            <textarea
              rows={2}
              value={form.note}
              onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
            />
          </label>
          <div className="form-row form-row-tight">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.hasPhoto}
                onChange={e => setForm(f => ({ ...f, hasPhoto: e.target.checked }))}
              />
              Attach a photo (mock)
            </label>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting\u2026' : 'Submit report'}
            </button>
          </div>
        </form>

        {reports.length > 0 && (
          <ul className="submitted-reports">
            {reports.map(r => (
              <li key={r.id}>
                <span className="report-type">{r.type}</span>
                <span className="report-location">{r.location}</span>
                {r.hasPhoto && <span className="pill pill-teal">Photo attached</span>}
                <span className="report-time">{new Date(r.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-title">Parking intelligence</h2>
        
        {/* Pune P1/P2 Parking Rule Alert */}
        <div style={{ background: 'var(--brick-soft)', borderLeft: '4px solid var(--brick)', padding: '14px 18px', marginBottom: '24px', borderRadius: '2px' }}>
          <h3 style={{ fontSize: '0.95rem', marginBottom: '6px', color: 'var(--brick)' }}>⚠️ Pune P1/P2 Parking Rule Active</h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--ink)' }}>
            To prevent congestion, Pune enforces alternate-side street parking. Look for street signs marking <strong>P1 (Odd dates)</strong> and <strong>P2 (Even dates)</strong>. 
            <br /><br />
            Today is the <strong>{today}{ordinal} ({isOdd ? 'Odd' : 'Even'})</strong>. You must park your vehicle on the <strong>{isOdd ? 'P1' : 'P2'}</strong> side of the street to avoid being towed by the traffic police.
          </p>
        </div>

        <div className="parking-grid">
          {parkingSpots.map(p => (
            <div key={p.id} className="parking-card">
              <div className="parking-head">
                <h3>{p.near}</h3>
                <span className={`availability-label availability-${p.availability.toLowerCase()}`}>
                  {p.availability} availability
                </span>
              </div>
              <div className="availability-bar">
                <div
                  className={`availability-fill availability-fill-${p.availability.toLowerCase()}`}
                  style={{ width: AVAILABILITY_WIDTH[p.availability] }}
                />
              </div>
              <p>{p.note}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
