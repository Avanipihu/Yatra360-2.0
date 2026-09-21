import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { useBusinessAuth } from '../BusinessAuthContext'

export default function BusinessLogin() {
  const { signIn } = useBusinessAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const redirectTo = location.state?.from || '/business/app/crowd'

  async function attempt(email, password) {
    setBusy(true)
    setError(null)
    try {
      await signIn(email, password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not sign you in just now.')
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Enter both your work email and password.')
      return
    }
    attempt(form.email, form.password)
  }

  return (
    <AuthLayout
      title="Business console"
      intro="Sign in to see crowd levels, demand forecasts and recommended actions for your own block."
      footer={<>No account yet? <Link to="/business/register">Register your business</Link></>}
    >
      <form onSubmit={handleSubmit} noValidate className="biz-form">
        {error && <div className="biz-error">{error}</div>}

        <div className="biz-field">
          <label htmlFor="biz-email">Work email</label>
          <input
            id="biz-email"
            type="email"
            autoComplete="username"
            placeholder="you@business.in"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="biz-field">
          <label htmlFor="biz-password">Password</label>
          <input
            id="biz-password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="biz-form-actions">
          <button className="biz-btn biz-btn-primary" disabled={busy}>
            {busy ? 'Signing in\u2026' : 'Sign in'}
          </button>
          <button
            type="button"
            className="biz-btn"
            disabled={busy}
            onClick={() => attempt('owner@kakahalwai.in', 'yatra360demo')}
          >
            Use demo account
          </button>
        </div>

        <p className="biz-hint">
          The demo account is a Kasba Peth sweet shop, so the dashboard loads with
          Shaniwar Wada and Dagdusheth inside its radius.
        </p>
      </form>
    </AuthLayout>
  )
}
