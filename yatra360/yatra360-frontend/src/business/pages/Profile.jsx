import { useState } from 'react'
import { useBusinessAuth } from '../BusinessAuthContext'
import PlacePhoto from '../../components/PlacePhoto'

const SEGMENTS = ['Family', 'Solo', 'Couples', 'Groups', 'Walk-in', 'Pre-booked', 'Senior citizens']

export default function Profile() {
  const { business, updateProfile } = useBusinessAuth()

  const [form, setForm] = useState({
    name: business?.name || '',
    phone: business?.phone || '',
    address: business?.address || '',
    capacity: String(business?.capacity ?? ''),
    pricePerNight: business?.pricePerNight ? String(business.pricePerNight) : '',
    cuisine: business?.cuisine || '',
    signatureItem: business?.signatureItem || '',
    tagline: business?.tagline || '',
    hours: business?.hours || '',
    imageUrl: business?.imageUrl || '',
    segments: business?.segments || [],
    isListed: business?.isListed ?? true,
  })
  const [status, setStatus] = useState(null)
  const [busy, setBusy] = useState(false)

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  function toggleSegment(value) {
    setForm(f => ({
      ...f,
      segments: f.segments.includes(value)
        ? f.segments.filter(s => s !== value)
        : [...f.segments, value],
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setStatus(null)
    try {
      await updateProfile({
        name: form.name,
        phone: form.phone || null,
        address: form.address,
        capacity: Number(form.capacity) || 0,
        pricePerNight: form.pricePerNight ? Number(form.pricePerNight) : null,
        cuisine: form.cuisine || null,
        signatureItem: form.signatureItem || null,
        tagline: form.tagline || null,
        hours: form.hours,
        imageUrl: form.imageUrl || null,
        segments: form.segments,
        isListed: form.isListed,
      })
      setStatus('Saved. Tourists will see the updated listing straight away.')
    } catch (err) {
      setStatus(err.message || 'Could not save those changes.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="biz-page">
      <header className="biz-page-head">
        <div>
          <h1>My listing</h1>
          <p>This is what a tourist sees. Capacity is what turns a crowd forecast into a real recommendation.</p>
        </div>
        <span className="biz-label">
          {business?.isVerified ? 'VERIFIED LOCAL' : 'REGISTERED'}
        </span>
      </header>

      <div className="biz-sheet">
        <div className="biz-col">
          <section className="biz-mod">
            <div className="biz-mod-head"><h3>Edit your details</h3></div>

            <form className="biz-form" onSubmit={handleSubmit}>
              {status && <div className="biz-notice">{status}</div>}

              <div className="biz-field">
                <label htmlFor="p-name">Business name</label>
                <input id="p-name" value={form.name} onChange={set('name')} />
              </div>

              <div className="biz-row2">
                <div className="biz-field">
                  <label htmlFor="p-phone">Phone</label>
                  <input id="p-phone" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="biz-field">
                  <label htmlFor="p-hours">Opening hours</label>
                  <input id="p-hours" value={form.hours} onChange={set('hours')} />
                </div>
              </div>

              <div className="biz-field">
                <label htmlFor="p-addr">Street address</label>
                <textarea id="p-addr" rows="2" value={form.address} onChange={set('address')} />
              </div>

              <div className="biz-row2">
                <div className="biz-field">
                  <label htmlFor="p-cap">Capacity ({business?.capacityUnit})</label>
                  <input id="p-cap" inputMode="numeric" value={form.capacity} onChange={set('capacity')} />
                </div>
                <div className="biz-field">
                  <label htmlFor="p-rate">Nightly rate (&#8377;, stays only)</label>
                  <input id="p-rate" inputMode="numeric" value={form.pricePerNight} onChange={set('pricePerNight')} />
                </div>
              </div>

              <div className="biz-row2">
                <div className="biz-field">
                  <label htmlFor="p-cuisine">Cuisine (food businesses)</label>
                  <input id="p-cuisine" value={form.cuisine} onChange={set('cuisine')} />
                </div>
                <div className="biz-field">
                  <label htmlFor="p-sig">Known for</label>
                  <input id="p-sig" value={form.signatureItem} onChange={set('signatureItem')} />
                </div>
              </div>

              <div className="biz-field">
                <label htmlFor="p-tag">One line about you</label>
                <textarea id="p-tag" rows="2" value={form.tagline} onChange={set('tagline')} />
              </div>

              <div className="biz-field">
                <label htmlFor="p-img">Photo URL</label>
                <input id="p-img" value={form.imageUrl} onChange={set('imageUrl')} placeholder="https://\u2026" />
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
              </div>

              <label className="biz-toggle">
                <input
                  type="checkbox"
                  checked={form.isListed}
                  onChange={e => setForm(f => ({ ...f, isListed: e.target.checked }))}
                />
                <span>Show my business to tourists</span>
              </label>

              <div className="biz-form-actions">
                <button className="biz-btn biz-btn-primary" disabled={busy}>
                  {busy ? 'Saving\u2026' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>

        <div className="biz-col">
          <section className="biz-mod">
            <div className="biz-mod-head"><h3>How tourists see you</h3></div>
            <article className="locals-card biz-preview">
              <PlacePhoto src={form.imageUrl} name={form.name} ratio="4 / 3">
                {business?.isVerified && <span className="locals-verified">Verified local</span>}
              </PlacePhoto>
              <div className="locals-card-body">
                <h3>{form.name || 'Your business'}</h3>
                <p className="locals-meta">
                  {[form.cuisine, business?.locality].filter(Boolean).join(' \u00B7 ')}
                </p>
                {form.tagline && <p className="locals-tagline">{form.tagline}</p>}
                {form.signatureItem && (
                  <p className="locals-signature"><span>Known for</span> {form.signatureItem}</p>
                )}
                <div className="locals-footer">
                  <span className="locals-rating">&#9733; {business?.rating?.toFixed(1)}</span>
                  <span className="locals-hours">{form.hours}</span>
                </div>
              </div>
            </article>
          </section>

          <section className="biz-mod">
            <div className="biz-mod-head"><h3>Account</h3></div>
            <div className="biz-kv"><span>Email</span><b>{business?.email}</b></div>
            <div className="biz-kv"><span>Category</span><b>{business?.category}</b></div>
            <div className="biz-kv"><span>Locality</span><b>{business?.locality}</b></div>
            <div className="biz-kv"><span>Price band</span><b>{business?.priceBand}</b></div>
            <p className="biz-note">
              Locality drives your demand radius. To move it, contact support &mdash; changing it
              re-scopes every forecast on your account.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
