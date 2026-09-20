import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/role')
  }

  const handleGuest = () => {
    navigate('/role')
  }

  return (
    <div className="auth-page">

      <section className="auth-intro">
       <img
        src="/yatra360-logo.png"
        alt="Yatra360"
        className="auth-logo"
       />

        <div className="auth-intro-content">
          <p className="auth-label">YATRA 360 / CITY INTELLIGENCE</p>

          <h1>
            One login,
            <br />
            the whole city.
          </h1>

          <p>
            Mobility, crowd intelligence, itineraries,
            safety and parking — all connected behind
            a single Yatra360 account.
          </p>
        </div>
      </section>

      <section className="auth-form-section">
        <div className="auth-form">

          <p className="auth-label">
            {isSignUp ? 'NEW ACCOUNT' : 'WELCOME BACK'}
          </p>

          <h2>
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>

          <p className="auth-description">
            {isSignUp
              ? 'Create an account to start your Yatra360 journey.'
              : 'Log in to reach your Pune travel command center.'}
          </p>

          <form onSubmit={handleSubmit}>

            {isSignUp && (
              <div className="form-field">
                <label>Full name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label>Email or username</label>
              <input
                type="text"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="auth-primary-button">
              {isSignUp ? 'Create account' : 'Log in'}
            </button>

          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          {!isSignUp && (
            <button
              onClick={handleGuest}
              className="auth-secondary-button"
            >
              Continue as guest
            </button>
          )}

          <p className="auth-switch">
            {isSignUp
              ? 'Already have an account?'
              : "Don't have an account?"}

            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="auth-link-button"
            >
              {isSignUp ? 'Log in' : 'Create an account'}
            </button>
          </p>

        </div>
      </section>

    </div>
  )
}