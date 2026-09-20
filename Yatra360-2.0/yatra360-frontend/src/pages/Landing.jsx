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

           <div className="hero-route-line"></div>

<div className="hero-route-stop stop-one">
  <span></span>
</div>

<div className="hero-route-stop stop-two">
  <span></span>
</div>

<div className="hero-route-stop stop-three">
  <span></span>
</div>

<div className="hero-route-stop stop-four">
  <span></span>
</div>

            <div className="route-stop stop-four">
              <span></span>
            </div>

            <div className="map-label label-one">
              EXPLORE
            </div>

            <div className="map-label label-two">
              MOVE
            </div>

            <div className="map-label label-three">
              DISCOVER
            </div>

            <div className="map-label label-four">
              PUNE
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
