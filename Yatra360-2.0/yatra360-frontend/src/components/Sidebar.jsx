import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/', label: 'Trip profile', icon: IconCompass },
  { to: '/itinerary', label: 'Itinerary', icon: IconRoute },
  { to: '/mobility', label: 'Smart mobility', icon: IconTransit },
  { to: '/safety-weather', label: 'Weather & safety', icon: IconShield },
  { to: '/crowd', label: 'Crowd redistribution', icon: IconSwap },
  { to: '/city-reports', label: 'City reports & parking', icon: IconPin }
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true" />
        <span className="brand-name">Yatra360</span>
      </div>
      <nav className="nav">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => 'nav-item' + (isActive ? ' nav-item-active' : '')}
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <p>Pune prototype &middot; estimated demand, not live tracking</p>
      </div>
    </aside>
  )
}

function IconCompass() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M15 9L13 13L9 15L11 11L15 9Z" fill="currentColor"/></svg>
}
function IconRoute() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="5" cy="6" r="2" stroke="currentColor" strokeWidth="1.6"/><circle cx="19" cy="18" r="2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 8v4a4 4 0 0 0 4 4h6a4 4 0 0 1 4 4" stroke="currentColor" strokeWidth="1.6"/></svg>
}
function IconTransit() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="5" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M5 13h14M9 20l-1.5 2M15 20l1.5 2" stroke="currentColor" strokeWidth="1.6"/><circle cx="8.5" cy="9.5" r="1" fill="currentColor"/><circle cx="15.5" cy="9.5" r="1" fill="currentColor"/></svg>
}
function IconShield() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" stroke="currentColor" strokeWidth="1.6"/></svg>
}
function IconSwap() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 8h13l-3-3M20 16H7l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
}
function IconPin() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" stroke="currentColor" strokeWidth="1.6"/><circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.6"/></svg>
}
