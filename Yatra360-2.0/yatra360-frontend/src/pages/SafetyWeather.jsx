import { useEffect, useState } from 'react'
import { api } from '../services/api'
import VerifiedBadge from '../components/VerifiedBadge'

const TYPE_URGENCY = {
  Police: 'urgent',
  'Women\u2019s Helpline': 'urgent',
  Ambulance: 'urgent',
  Hospital: 'standard',
  'Tourist Helpline': 'standard'
}

export default function SafetyWeather() {
  const [contacts, setContacts] = useState([])
  const [weather, setWeather] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      api.getEmergencyContacts().catch(() => []),
      api.getWeather().catch(() => null),
    ]).then(([contactsData, weatherData]) => {
      if (cancelled) return
      setContacts(contactsData)
      setWeather(weatherData)
    }).finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  return (
    <div className="page">
      <header className="page-header">
        <h1>Weather & safety</h1>
        <p className="page-sub">Verified emergency information with sources and check dates &mdash; no guesswork.</p>
      </header>

      {isLoading && <p className="hint-text">Loading&hellip;</p>}

      {weather && (
        <section className="weather-card">
          <div>
            <p className="weather-temp">{weather.tempC}&deg;C</p>
            <p className="weather-location">{weather.location}</p>
          </div>
          <div className="weather-details">
            <p>{weather.condition}</p>
            <p className="weather-humidity">Humidity {weather.humidity}%</p>
            <p className="weather-advisory">{weather.advisory}</p>
          </div>
        </section>
      )}

      {!isLoading && (
        <section>
          <h2 className="section-title">Emergency contacts</h2>
          <ul className="contact-list">
            {contacts.map(c => (
              <li
                key={c.name}
                className={'contact-row ' + (TYPE_URGENCY[c.type] === 'urgent' ? 'contact-urgent' : 'contact-standard')}
              >
                <div className="contact-main">
                  <span className="contact-type">{c.type}</span>
                  <h3>{c.name}</h3>
                  <p className="contact-area">{c.area}</p>
                </div>
                <div className="contact-side">
                  <a className="contact-number" href={`tel:${c.number}`}>{c.number}</a>
                  <VerifiedBadge source={c.source} lastVerified={c.lastVerified} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
