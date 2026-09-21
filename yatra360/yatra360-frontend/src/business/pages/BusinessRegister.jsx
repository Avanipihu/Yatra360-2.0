import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useBusinessAuth } from '../BusinessAuthContext'
import { api } from '../../services/api'

const FALLBACK_CATEGORIES = [
  'Café & restaurant', 'Sweets & snacks', 'Street food stall',
  'Hotel', 'Homestay / guest house', 'Guide & tour operator',
  'Artisan & handicrafts', 'Retail & souvenirs',
  'Transport & rentals', 'Experience & workshop',
]

const LOCALITIES = [
  'Kasba Peth', 'Budhwar Peth', 'Shivajinagar', 'Deccan Gymkhana', 'FC Road',
  'JM Road', 'Koregaon Park', 'Kalyani Nagar', 'Camp (MG Road)', 'Kothrud',
  'Aundh', 'Baner', 'Viman Nagar', 'Hadapsar', 'Wakad', 'Pashan', 'Yerawada',
  'Magarpatta City', 'Kharadi', 'Wanowrie',
]

const SEGMENTS = ['Family', 'Solo', 'Couples', 'Groups', 'Walk-in', 'Pre-booked', 'Senior citizens']
const PRICE_BANDS = ['Low', 'Moderate', 'Premium']
const STEPS = ['Identity', 'Location & capacity', 'What you offer']

// Capacity means something different per category, so the unit follows it.
const STAY = ['Hotel', 'Homestay / guest house']
const FOOD = ['Café & restaurant', 'Sweets & snacks', 'Street food stall']

function unitFor(category) {
  if (STAY.includes(category)) return 'rooms'
  if (FOOD.includes(category)) return 'seats'
  if (category === 'Guide & tour operator') return 'people per tour'
  return 'visitors at once'
}

export default function BusinessRegister() {
  const { register } = useBusinessAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES)
  const [step, setStep] = useState(1)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const [form, setForm] = useState({
    name: '', category: FALLBACK_CATEGORIES[0], phone: '', email: '',
    locality: LOCALITIES[0], address: '', capacity: '40',
    priceBand: 'Moderate', pricePerNight: '', cuisine: '', signatureItem: '',
    tagline: '', hours: '09:00-22:00', segments: ['Family', 'Walk-in'],
    imageUrl: '', password: '',
  })

  useEffect(() => {
    let cancelled = false
    api.business.categories()
      .then(list => { if (!cancelled && list?.length) setCategories(list) })
      .catch(() => { /* fallback list is already in state */ })
    return () => { cancelled = true }
  }, [])

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))
  const isStay = STAY.includes(form.category)
  const isFood = FOOD.includes(form.category)

  function validate() {
    if (step === 1) {
      if (!form.name.trim()) return 'Enter the name your business trades under.'
      if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'That email address looks incomplete.'
    }
    if (step === 2) {
      if (!form.address.trim()) return 'Add a street address so we can place you inside a demand radius.'
      if (!/^\d+$/.test(String(form.capacity))) return 'Capacity should be a plain number, for example 40.'
    }
    if (step === 3) {
      if (form.segments.length === 0) return 'Pick at least one visitor type you serve.'
      if (form.password.length < 8) return 'Passwords need at least 8 characters.'
    }
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }
    setError(null)

    if (step < 3) {
      setStep(step + 1)
      return
    }

    setBusy(true)
    try {
      await register({
        name: form.name.trim(),
        category: form.category,
        email: form.email.trim(),
        password: form.password,
        phone: form.phone || null,
        locality: form.locality,
        address: form.address,
        capacity: Number(form.capacity) || 0,
        capacityUnit: unitFor(form.category),
        pricePerNight: isStay && form.pricePerNight ? Number(form.pricePerNight) : null,
        priceBand: form.priceBand,
        cuisine: isFood ? form.cuisine || null : null,
        signatureItem: form.signatureItem || null,
        tagline: form.tagline || null,
        hours: form.hours,
        segments: form.segments,
        imageUrl: form.imageUrl || null,
      })
      navigate('/business/app/crowd', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create that account.')
      setBusy(false)
    }
  }

  function toggleSegment(value) {
    setForm(f => ({
      ...f,
      segments: f.segments.includes(value)
        ? f.segments.filter(s => s !== value)
        : [...f.segments, value],
    }))
  }

  return (
    <AuthLayout
      title="Register your business"
      intro="Three short steps. Once you're listed, tourist itineraries can route demand to your street."
      steps={
        <div className="biz-steps">
          {STEPS.map((label, i) => (
            <div
              key={label}
              className={'biz-step' + (step === i + 1 ? ' biz-step-on' : step > i + 1 ? ' biz-step-done' : '')}
            >
              <b>{i + 1}</b> {label}
            </div>
          ))}
        </div>
      }
      footer={<>Already registered? <Link to="/business/login">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="biz-form">
        {error && <div className="biz-error">{error}</div>}

        {step === 1 && (
          <fieldset>
            <div className="biz-field">
              <label htmlFor="r-name">Business name</label>
              <input id="r-name" value={form.name} onChange={set('name')}
                placeholder="As it appears on your signboard" />
            </div>

            <div className="biz-row2">
              <div className="biz-field">
                <label htmlFor="r-cat">What you run</label>
                <select id="r-cat" value={form.category} onChange={set('category')}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="biz-field">
                <label htmlFor="r-phone">Phone</label>
                <input id="r-phone" inputMode="tel" value={form.phone} onChange={set('phone')} placeholder="+91" />
              </div>
            </div>

            <div className="biz-field">
              <label htmlFor="r-email">Work email</label>
              <input id="r-email" type="email" value={form.email} onChange={set('email')}
                placeholder="you@business.in" />
              <p className="biz-hint">Used for sign-in and your daily demand brief. One account per outlet.</p>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset>
            <div className="biz-field">
              <label htmlFor="r-loc">Locality</label>
              <select id="r-loc" value={form.locality} onChange={set('locality')}>
                {LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <p className="biz-hint">Your demand radius is drawn around this point.</p>
            </div>

            <div className="biz-field">
              <label htmlFor="r-addr">Street address</label>
              <textarea id="r-addr" rows="3" value={form.address} onChange={set('address')}
                placeholder="Shop number, lane, landmark" />
            </div>

            <div className="biz-row2">
              <div className="biz-field">
                <label htmlFor="r-cap">How many you can serve at peak</label>
                <input id="r-cap" inputMode="numeric" value={form.capacity} onChange={set('capacity')} />
                <p className="biz-hint">Measured in {unitFor(form.category)}.</p>
              </div>
              <div className="biz-field">
                <label htmlFor="r-band">Price band</label>
                <select id="r-band" value={form.priceBand} onChange={set('priceBand')}>
                  {PRICE_BANDS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            {isStay && (
              <div className="biz-field">
                <label htmlFor="r-rate">Nightly rate (&#8377;)</label>
                <input id="r-rate" inputMode="numeric" value={form.pricePerNight}
                  onChange={set('pricePerNight')} placeholder="1800" />
                <p className="biz-hint">This is what tourists see in the stay picker.</p>
              </div>
            )}
          </fieldset>
        )}

        {step === 3 && (
          <fieldset>
            {isFood && (
              <div className="biz-field">
                <label htmlFor="r-cuisine">Cuisine</label>
                <input id="r-cuisine" value={form.cuisine} onChange={set('cuisine')}
                  placeholder="Maharashtrian sweets, South Indian, chaat\u2026" />
              </div>
            )}

            <div className="biz-field">
              <label htmlFor="r-sig">What you're known for</label>
              <input id="r-sig" value={form.signatureItem} onChange={set('signatureItem')}
                placeholder="Warm pedha, sunrise fort walk, hand-beaten brass diyas\u2026" />
            </div>

            <div className="biz-field">
              <label htmlFor="r-tag">One line about you</label>
              <textarea id="r-tag" rows="2" value={form.tagline} onChange={set('tagline')}
                placeholder="Four generations of the same recipe, made fresh every morning." />
              <p className="biz-hint">Shown on your card in Locals' Favourites.</p>
            </div>

            <div className="biz-field">
              <label>Who you serve best</label>
              <div className="biz-chips">
                {SEGMENTS.map(s => (
                  <button
                    type="button" key={s} className="biz-chip"
                    aria-pressed={form.segments.includes(s)}
                    onClick={() => toggleSegment(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="biz-hint">We match these against the segment mix arriving in your radius.</p>
            </div>

            <div className="biz-row2">
              <div className="biz-field">
                <label htmlFor="r-hours">Opening hours</label>
                <input id="r-hours" value={form.hours} onChange={set('hours')} />
              </div>
              <div className="biz-field">
                <label htmlFor="r-img">Photo URL (optional)</label>
                <input id="r-img" value={form.imageUrl} onChange={set('imageUrl')}
                  placeholder="https://\u2026" />
              </div>
            </div>

            <div className="biz-field">
              <label htmlFor="r-pw">Create a password</label>
              <input id="r-pw" type="password" autoComplete="new-password"
                value={form.password} onChange={set('password')} placeholder="At least 8 characters" />
            </div>
          </fieldset>
        )}

        <div className="biz-form-actions">
          {step > 1 && (
            <button type="button" className="biz-btn" onClick={() => setStep(step - 1)} disabled={busy}>
              Back
            </button>
          )}
          <button className="biz-btn biz-btn-primary" disabled={busy}>
            {busy ? 'Creating\u2026' : step < 3 ? 'Continue' : 'Create business account'}
          </button>
          <span className="biz-step-count">Step {step} of 3</span>
        </div>
      </form>
    </AuthLayout>
  )
}
