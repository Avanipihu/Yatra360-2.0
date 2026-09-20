import { useNavigate } from 'react-router-dom'

export default function RoleSelection() {
  const navigate = useNavigate()

  const handleTourist = () => {
    navigate('/onboarding')
  }

  const handleBusiness = () => {
    window.location.href = 'https://yatra360-buisness.onrender.com/'
  }

  return (
    <div className="role-page">

      <header className="role-header">
        <img
          src="/yatra360-logo.png"
          alt="Yatra360"
          className="auth-logo"
        />

      </header>

      <main className="role-content">

        <p className="auth-label">
          YOUR YATRA360 JOURNEY
        </p>

        <h1>
          How will you use Yatra360?
        </h1>

        <p className="role-description">
          Choose how you'd like to continue.
        </p>

        <div className="role-options">

          <button
            className="role-option"
            onClick={handleTourist}
          >
            <div className="role-option-top">
              <span>01</span>
              <span>TRAVEL</span>
            </div>

            <div>
              <h2>Tourist</h2>

              <p>
                Plan and experience your journey using mobility,
                safety, crowd and local city intelligence.
              </p>
            </div>

            <div className="role-action">
              Enter as tourist →
            </div>
          </button>

          <button
            className="role-option"
            onClick={handleBusiness}
          >
            <div className="role-option-top">
              <span>02</span>
              <span>LOCAL BUSINESS</span>
            </div>

            <div>
              <h2>Local Business</h2>

              <p>
                Understand tourism demand and connect your business
                with visitors exploring the city.
              </p>
            </div>

            <div className="role-action">
              Enter as business →
            </div>
          </button>

        </div>

      </main>
    </div>
  )
}
