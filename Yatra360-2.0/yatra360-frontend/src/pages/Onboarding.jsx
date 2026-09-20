import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrip } from '../context/TripContext'
import {
  INTERESTS, GROUP_TYPES, BUDGETS, MOBILITY_PREFS, ACCESSIBILITY
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
  const hotelOptions = matchingHotels.length > 0 ? matchingHotels : hotels

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
            <p>See sample options in your budget range and pick one.</p>
          </button>
        </div>
        {isSubmitting && <p className="hint-text">Building your itinerary&hellip;</p>}
      </div>
    )
  }

  if (step === 'hotel-options') {
    return (
      <div className="page onboarding">
        <header className="page-header">
          <h1>Hotel options for a {form.budget.toLowerCase()} budget</h1>
          <p className="page-sub">Sample listings for the prototype &mdash; production build will pull from verified government/licensed tourism sources.</p>
        </header>
        <div className="hotel-grid">
          {hotelOptions.map(h => (
            <button key={h.id} className="hotel-card" disabled={isSubmitting} onClick={() => finishOnboarding(true, h.id)}>
              <h3>{h.name}</h3>
              <p className="hotel-area">{h.area} &middot; {h.distanceToCenterKm} km from city centre</p>
              <div className="hotel-meta">
                <span className="hotel-price">₹{h.pricePerNight.toLocaleString('en-IN')}/night</span>
                <span className="hotel-rating">★ {h.rating}</span>
              </div>
              <p className="hotel-source">{h.source}</p>
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
                  {b}
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
