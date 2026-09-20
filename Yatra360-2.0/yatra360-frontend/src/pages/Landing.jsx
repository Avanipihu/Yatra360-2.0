import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">

      {/* Header */}
      <header className="landing-header">
        <img
          src="/yatra360-logo.png"
          alt="Yatra360"
          className="landing-logo"
        />
      </header>

      {/* Main */}
      <main className="landing-main">

        {/* Left content */}
        <section className="landing-copy">

          <p className="landing-label">
            PUNE · TRAVEL INTELLIGENCE
          </p>

          <h1>
            Explore Pune
            <br />
            smarter.
            <br />
            Travel safer.
            <br />
            Move better.
          </h1>

          <p className="landing-description">
            Yatra360 brings tourism, mobility, safety, and
            crowd intelligence together to help you navigate
            Pune with confidence.
          </p>

          <div className="landing-actions">
            <button
              className="landing-primary-btn"
              onClick={() => navigate('/login')}
            >
              Get started →
            </button>
          </div>

        </section>

        {/* Right route illustration */}
        <section className="route-illustration">

          <div className="route-map">

            <div className="route-grid"></div>

            <div className="route-glow"></div>

            <svg
              className="route-path"
              viewBox="0 0 400 500"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                d="
                  M 65 440
                  C 115 415, 115 350, 165 325
                  C 220 298, 205 235, 205 195
                  C 205 145, 255 115, 335 60
                "
              />
            </svg>

            <div className="route-start">
              <span></span>
              <label>Start</label>
            </div>

            <div className="route-destination">
              <span></span>
              <label>Destination</label>
            </div>

          </div>

        </section>

      </main>

      {/* Feature strip */}
      <footer className="landing-footer">

        <span>SMART MOBILITY</span>
        <span>CROWD INTELLIGENCE</span>
        <span>ITINERARIES</span>
        <span>SAFETY</span>
        <span>PARKING</span>

      </footer>

    </div>
  )
}
