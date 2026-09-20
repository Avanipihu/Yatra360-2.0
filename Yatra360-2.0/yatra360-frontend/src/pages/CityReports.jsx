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

  return (
    <div className="page">
      <header className="page-header">
        <h1>City reports & parking</h1>
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
