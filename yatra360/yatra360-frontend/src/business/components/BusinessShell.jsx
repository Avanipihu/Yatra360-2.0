import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useBusinessAuth } from '../BusinessAuthContext'

const NAV = [
  { to: '/business/app/crowd', label: 'Crowd & opportunity' },
  { to: '/business/app/opportunities', label: 'Opportunity alerts' },
  { to: '/business/app/analytics', label: 'Analytics' },
  { to: '/business/app/profile', label: 'My listing' },
]

export default function BusinessShell() {
  const { business, signOut } = useBusinessAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleSignOut() {
    signOut()
    navigate('/business/login')
  }

  return (
    <div className="biz-shell">
      <aside className={'biz-rail' + (menuOpen ? ' biz-rail-open' : '')}>
        <div className="biz-rail-head">
          <img src="/yatra360-logo.png" alt="Yatra360" className="biz-rail-logo" />
          <span className="biz-rail-sys">BUSINESS CONSOLE</span>
        </div>

        <nav className="biz-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => 'biz-nav-item' + (isActive ? ' biz-nav-item-active' : '')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="biz-rail-foot">
          <div className="biz-who">{business?.name || 'Your business'}</div>
          <div className="biz-where">
            {[business?.category, business?.locality].filter(Boolean).join(' \u00B7 ')}
          </div>
          <button className="biz-btn biz-btn-ghost" onClick={handleSignOut}>Sign out</button>
          <button className="biz-btn biz-btn-ghost" onClick={() => navigate('/')}>
            Back to Yatra360
          </button>
        </div>
      </aside>

      <div
        className={'biz-scrim' + (menuOpen ? ' biz-scrim-on' : '')}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      <div className="biz-main">
        <button
          className="biz-btn biz-btn-ghost biz-rail-toggle"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </button>
        <Outlet />
      </div>
    </div>
  )
}
