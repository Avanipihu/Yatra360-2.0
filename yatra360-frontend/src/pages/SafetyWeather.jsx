import { EMERGENCY_CONTACTS, WEATHER_MOCK } from '../data/mockData'
import VerifiedBadge from '../components/VerifiedBadge'

const TYPE_URGENCY = {
  Police: 'urgent',
  'Women\u2019s Helpline': 'urgent',
  Ambulance: 'urgent',
  Hospital: 'standard',
  'Tourist Helpline': 'standard'
}

export default function SafetyWeather() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Weather & safety</h1>
        <p className="page-sub">Verified emergency information with sources and check dates &mdash; no guesswork.</p>
      </header>

      <section className="weather-card">
        <div>
          <p className="weather-temp">{WEATHER_MOCK.tempC}&deg;C</p>
          <p className="weather-location">{WEATHER_MOCK.location}</p>
        </div>
        <div className="weather-details">
          <p>{WEATHER_MOCK.condition}</p>
          <p className="weather-humidity">Humidity {WEATHER_MOCK.humidity}%</p>
          <p className="weather-advisory">{WEATHER_MOCK.advisory}</p>
        </div>
      </section>

      <section>
        <h2 className="section-title">Emergency contacts</h2>
        <ul className="contact-list">
          {EMERGENCY_CONTACTS.map(c => (
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
    </div>
  )
}
