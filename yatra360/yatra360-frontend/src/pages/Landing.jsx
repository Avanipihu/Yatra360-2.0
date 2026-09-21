import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Pre-login front page.
 *
 * Two audiences land here — visitors planning a trip, and Pune businesses
 * wanting to reach them — so the page has to say what Yatra360 does for
 * each without becoming a wall of marketing copy.
 */

const PILLARS = [
  {
    kicker: '01',
    title: 'Plan around the crowd, not into it',
    body: 'Every stop carries an estimated demand level. When somewhere is heaving, we name a quieter place that gives you the same thing.',
  },
  {
    kicker: '02',
    title: 'One honest comparison for every journey',
    body: 'Metro, bus, auto, cab or on foot — compared on what you actually pay, how long it really takes and how far you have to walk.',
  },
  {
    kicker: '03',
    title: 'Weather, safety and the state of the street',
    body: 'Verified helpline numbers, live advisories and resident-reported potholes, waterlogging and parking, all in one place.',
  },
  {
    kicker: '04',
    title: 'The Pune that locals actually use',
    body: 'Family-run homestays, neighbourhood cafes, artisans and licensed guides — registered by their owners, not scraped from a chain listing.',
  },
]

const STATS = [
  { value: '60+', label: 'Mapped locations' },
  { value: '2', label: 'Metro lines routed' },
  { value: '5', label: 'Crowd swap pairs' },
  { value: '10', label: 'Business categories' },
]

const MARQUEE = [
  'SHANIWAR WADA', 'KASBA PETH', 'AGA KHAN PALACE', 'SINHAGAD FORT',
  'PATALESHWAR', 'TULSHIBAUG', 'VETAL TEKDI', 'SARAS BAUG',
  'KOREGAON PARK', 'DECCAN GYMKHANA', 'PASHAN LAKE', 'PARVATI HILL',
]

export default function Landing() {
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="lp">

      <header className={'lp-nav' + (scrolled ? ' lp-nav-solid' : '')}>
        <img src="/yatra360-logo.png" alt="Yatra360" className="lp-nav-logo" />
        <nav className="lp-nav-links">
          <a href="#what">What it does</a>
          <a href="#business">For businesses</a>
        </nav>
        <button className="lp-nav-cta" onClick={() => navigate('/login')}>
          Sign in
        </button>
      </header>

      {/* ---------------- Hero ---------------- */}
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <p className="lp-eyebrow">PUNE · TRAVEL &amp; CITY INTELLIGENCE</p>

          <h1 className="lp-title">
            Explore Pune<br />
            <em>smarter.</em><br />
            Travel safer.<br />
            Move better.
          </h1>

          <p className="lp-lede">
            Yatra360 puts itineraries, transit, crowd levels, safety and the
            city&rsquo;s own small businesses in one place &mdash; so you spend
            your time in Pune, not planning around it.
          </p>

          <div className="lp-actions">
            <button className="lp-btn-primary" onClick={() => navigate('/login')}>
              Start planning
              <span aria-hidden="true">&rarr;</span>
            </button>
            <button className="lp-btn-ghost" onClick={() => navigate('/business/register')}>
              List your business
            </button>
          </div>

          <dl className="lp-stats">
            {STATS.map(s => (
              <div key={s.label}>
                <dt>{s.value}</dt>
                <dd>{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Route illustration — the original motif, rebuilt with live labels */}
        <div className="lp-hero-visual" aria-hidden="true">
          <div className="lp-map">
            <div className="lp-map-grid" />
            <div className="lp-map-glow" />

            <svg className="lp-map-route" viewBox="0 0 400 500" preserveAspectRatio="none">
              <path
                className="lp-map-route-bed"
                d="M 65 445 C 118 418, 112 348, 168 322 C 224 296, 204 232, 206 192 C 208 142, 258 112, 338 58"
              />
              <path
                className="lp-map-route-line"
                d="M 65 445 C 118 418, 112 348, 168 322 C 224 296, 204 232, 206 192 C 208 142, 258 112, 338 58"
              />
            </svg>

            <div className="lp-node lp-node-start">
              <span className="lp-node-dot" />
              <div className="lp-node-label">
                <b>Pune Station</b>
                <i>Start</i>
              </div>
            </div>

            <div className="lp-node lp-node-mid">
              <span className="lp-node-dot lp-node-dot-warn" />
              <div className="lp-node-label">
                <b>Shaniwar Wada</b>
                <i>Busy &middot; swap suggested</i>
              </div>
            </div>

            <div className="lp-node lp-node-end">
              <span className="lp-node-dot" />
              <div className="lp-node-label">
                <b>Kasba Peth</b>
                <i>Destination</i>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Marquee ---------------- */}
      <div className="lp-marquee" aria-hidden="true">
        <div className="lp-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </div>

      {/* ---------------- What it does ---------------- */}
      <section className="lp-section" id="what">
        <header className="lp-section-head">
          <p className="lp-eyebrow">WHAT YOU GET</p>
          <h2>Four things a map app won&rsquo;t tell you</h2>
        </header>

        <div className="lp-pillars">
          {PILLARS.map(p => (
            <article className="lp-pillar" key={p.kicker}>
              <span className="lp-pillar-num">{p.kicker}</span>
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- For businesses ---------------- */}
      <section className="lp-business" id="business">
        <div className="lp-business-inner">
          <div className="lp-business-copy">
            <p className="lp-eyebrow lp-eyebrow-light">FOR PUNE BUSINESSES</p>
            <h2>
              The crowd is already outside.<br />
              We tell you when.
            </h2>
            <p>
              Register your cafe, homestay, stall, workshop or guiding service and you
              appear inside tourist itineraries &mdash; not buried under five-star chains.
              The console shows crowd levels at the attractions around you, when your
              busiest window will be, and what to do about it.
            </p>

            <ul className="lp-business-list">
              <li>Crowd levels at every attraction inside your radius</li>
              <li>Hourly footfall forecast against your own capacity</li>
              <li>Opportunity alerts &mdash; high movement nearby, quiet spells, peak windows</li>
              <li>Profile views, traffic sources and peak demand periods</li>
            </ul>

            <div className="lp-actions">
              <button className="lp-btn-light" onClick={() => navigate('/business/register')}>
                Register your business
                <span aria-hidden="true">&rarr;</span>
              </button>
              <button className="lp-btn-ghost-light" onClick={() => navigate('/business/login')}>
                Business sign in
              </button>
            </div>
          </div>

          <div className="lp-business-panel" aria-hidden="true">
            <div className="lp-panel-head">
              <span>YOUR RADIUS · 2.5 KM</span>
              <span className="lp-panel-live">LIVE</span>
            </div>
            <div className="lp-panel-row">
              <span>Shaniwar Wada</span>
              <span className="lp-bar"><i style={{ width: '88%' }} /></span>
              <b>Very high</b>
            </div>
            <div className="lp-panel-row">
              <span>Dagdusheth Temple</span>
              <span className="lp-bar"><i style={{ width: '71%' }} /></span>
              <b>High</b>
            </div>
            <div className="lp-panel-row">
              <span>Vishrambaug Wada</span>
              <span className="lp-bar"><i style={{ width: '24%' }} /></span>
              <b>Low</b>
            </div>
            <div className="lp-panel-note">
              <b>Opportunity</b>
              Shaniwar Wada is very high right now. Put your board out facing
              the gate and lead with your signature dish.
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Closing ---------------- */}
      <section className="lp-close">
        <h2>Ready when you are.</h2>
        <p>Pick how you want to use Yatra360 and we&rsquo;ll take it from there.</p>
        <div className="lp-actions lp-actions-center">
          <button className="lp-btn-primary" onClick={() => navigate('/login')}>
            Get started
            <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </section>

      <footer className="lp-foot">
        <span>YATRA360 &middot; PUNE PROTOTYPE</span>
        <span>Estimated demand, not live tracking</span>
      </footer>
    </div>
  )
}
