import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import PlacePhoto from '../components/PlacePhoto'
import { api } from '../services/api'
import {
  INTERESTS, GROUP_TYPES, BUDGETS, BUDGET_LABELS, MOBILITY_PREFS, ACCESSIBILITY
} from '../constants'

export default function Onboarding() {
  const { profile, generateItinerary, hotels } = useTrip()
  const navigate = useNavigate()

  const [form, setForm] = useState(profile)
  const [step, setStep] = useState('profile') // 'profile' | 'hotel'
  const [isSubmitting, setIsSubmitting] = useState(false)

  function toggleFromList(field, value) {
    setForm(f => {
      const list = f[field]
      const next = list.includes(value) ? list.filter(v => v !== value) : [...list, value]
      return { ...f, [field]: next }
    })
  }

  function handleProfileSubmit(e) {
    e.preventDefault()
    setStep('hotel')
  }

  async function finishOnboarding(needsHotel, selectedHotelId = null) {
    const finalProfile = { ...form, needsHotel, selectedHotelId }
    setIsSubmitting(true)
    await generateItinerary(finalProfile)
    setIsSubmitting(false)
    navigate('/itinerary')
  }

  const matchingHotels = hotels.filter(h => h.budget === form.budget)
  // Local, owner-registered stays lead the list \u2014 that is the point of
  // merging the business registry into the tourist hotel section.
  const hotelOptions = [...(matchingHotels.length > 0 ? matchingHotels : hotels)]
    .sort((a, b) => Number(b.isLocal) - Number(a.isLocal))

  if (step === 'hotel') {
    return (
      <div className="page onboarding">
        <header className="page-header">
          <h1>Do you already have a place to stay?</h1>
          <p className="page-sub">This helps us anchor your itinerary and mobility routes to the right starting point.</p>
        </header>

        <div className="hotel-choice">
          <button className="choice-card" disabled={isSubmitting} onClick={() => finishOnboarding(true)}>
            <h3>I already have a hotel</h3>
            <p>We'll build your itinerary around a starting point you enter later.</p>
          </button>
          <button className="choice-card choice-card-primary" disabled={isSubmitting} onClick={() => setStep('hotel-options')}>
            <h3>I need a hotel</h3>
            <p>Browse stays in your budget, with local owner-run options first.</p>
          </button>
        </div>
        {isSubmitting && <p className="hint-text">Building your itinerary&hellip;</p>}
      </div>
    )
  }

  if (step === 'hotel-options') {
    const localCount = hotelOptions.filter(h => h.isLocal).length

    return (
      <div className="page onboarding">
        <header className="page-header">
          <h1>Places to stay in the {BUDGET_LABELS[form.budget] || form.budget} range</h1>
          <p className="page-sub">
            {localCount > 0
              ? `Including ${localCount} owner-run local stay${localCount === 1 ? '' : 's'} registered directly on Yatra360 \u2014 shown first.`
              : 'Sample listings for the prototype \u2014 the production build pulls from verified licensed tourism sources.'}
          </p>
        </header>

        <div className="hotel-grid">
          {hotelOptions.map(h => (
            <button
              key={h.id}
              className={'hotel-card' + (h.isLocal ? ' hotel-card-local' : '')}
              disabled={isSubmitting}
              onClick={() => finishOnboarding(true, h.id)}
              onMouseEnter={() => {
                // Only registered businesses have a views ledger to write to.
                if (h.isLocal) api.recordBusinessView(h.id.replace(/^biz-/, ''), 'listing')
              }}
            >
              <PlacePhoto src={h.imageUrl} name={h.name} ratio="16 / 10">
                {h.isLocal && <span className="hotel-local-flag">Local &amp; owner-run</span>}
              </PlacePhoto>

              <div className="hotel-card-body">
                <h3>{h.name}</h3>
                <p className="hotel-area">
                  {[h.area, h.distanceToCenterKm ? `${h.distanceToCenterKm} km from centre` : null]
                    .filter(Boolean)
                    .join(' \u00B7 ')}
                </p>
                {h.tagline && <p className="hotel-tagline">{h.tagline}</p>}
                <div className="hotel-meta">
                  <span className="hotel-price">\u20B9{h.pricePerNight.toLocaleString('en-IN')}/night</span>
                  {h.rating != null && <span className="hotel-rating">\u2605 {h.rating}</span>}
                </div>
                {h.capacity ? (
                  <p className="hotel-capacity">{h.capacity} {h.capacityUnit}</p>
                ) : null}
                <p className="hotel-source">{h.source}</p>
              </div>
            </button>
          ))}
        </div>

        <button className="link-back" onClick={() => setStep('hotel')}>&larr; Back</button>
      </div>
    )
  }

  return (
    <div className="page onboarding">
      <header className="page-header">
        <h1>Tell us about your trip</h1>
        <p className="page-sub">Not just where to go &mdash; how, when and why. This shapes every recommendation that follows.</p>
      </header>

      <form className="profile-form" onSubmit={handleProfileSubmit}>
        <div className="form-row">
          <label>
            Destination
            <input type="text" value={form.destination} readOnly />
          </label>
          <label>
            Start date
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              required
            />
          </label>
          <label>
            Number of days
            <input
              type="number" min="1" max="7"
              value={form.days}
              onChange={e => setForm(f => ({ ...f, days: Number(e.target.value) }))}
            />
          </label>
        </div>

        <fieldset>
          <legend>Group type</legend>
          <div className="chip-row">
            {GROUP_TYPES.map(g => (
              <button
                type="button" key={g}
                className={'chip' + (form.groupType === g ? ' chip-active' : '')}
                onClick={() => setForm(f => ({ ...f, groupType: g }))}
              >
                {g}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Interests (choose any)</legend>
          <div className="chip-row">
            {INTERESTS.map(i => (
              <button
                type="button" key={i}
                className={'chip' + (form.interests.includes(i) ? ' chip-active' : '')}
                onClick={() => toggleFromList('interests', i)}
              >
                {i}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="form-row">
          <fieldset>
            <legend>Budget</legend>
            <div className="chip-row">
              {BUDGETS.map(b => (
                <button
                  type="button" key={b}
                  className={'chip' + (form.budget === b ? ' chip-active' : '')}
                  onClick={() => setForm(f => ({ ...f, budget: b }))}
                >
                  {b} <span className="chip-sub">({BUDGET_LABELS[b]})</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend>Mobility preference</legend>
            <div className="chip-row">
              {MOBILITY_PREFS.map(m => (
                <button
                  type="button" key={m}
                  className={'chip' + (form.mobilityPref === m ? ' chip-active' : '')}
                  onClick={() => setForm(f => ({ ...f, mobilityPref: m }))}
                >
                  {m}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <fieldset>
          <legend>Accessibility needs (choose any)</legend>
          <div className="chip-row">
            {ACCESSIBILITY.map(a => (
              <button
                type="button" key={a}
                className={'chip' + (form.accessibility.includes(a) ? ' chip-active' : '')}
                onClick={() => toggleFromList('accessibility', a)}
              >
                {a}
              </button>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn-primary">Continue</button>
      </form>
    </div>
  )
}
