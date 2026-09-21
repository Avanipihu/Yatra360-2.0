import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Sidebar from './components/Sidebar'
import Onboarding from './pages/Onboarding'
import Itinerary from './pages/Itinerary'
import Mobility from './pages/Mobility'
import SafetyWeather from './pages/SafetyWeather'
import CrowdAlternatives from './pages/CrowdAlternatives'
import CityReports from './pages/CityReports'
import { TripProvider } from './context/TripContext'
import Login from './pages/Login'
import RoleSelection from './pages/RoleSelection'

// Business console — same SPA, mounted under /business/*
import { BusinessAuthProvider } from './business/BusinessAuthContext'
import RequireBusiness from './business/RequireBusiness'
import BusinessShell from './business/components/BusinessShell'
import BusinessLogin from './business/pages/BusinessLogin'
import BusinessRegister from './business/pages/BusinessRegister'
import CrowdDashboard from './business/pages/CrowdDashboard'
import Opportunities from './business/pages/Opportunities'
import Analytics from './business/pages/Analytics'
import Profile from './business/pages/Profile'

export default function App() {
  return (
    <BusinessAuthProvider>
      <TripProvider>
        <Routes>
          {/* ---- Public ---- */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/role" element={<RoleSelection />} />

          {/* ---- Business console ---- */}
          <Route path="/business" element={<Navigate to="/business/login" replace />} />
          <Route path="/business/login" element={<BusinessLogin />} />
          <Route path="/business/register" element={<BusinessRegister />} />
          <Route
            path="/business/app"
            element={
              <RequireBusiness>
                <BusinessShell />
              </RequireBusiness>
            }
          >
            <Route index element={<Navigate to="/business/app/crowd" replace />} />
            <Route path="crowd" element={<CrowdDashboard />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* ---- Tourist application ---- */}
          <Route
            path="*"
            element={
              <div className="app-shell">
                <Sidebar />
                <main className="main-content">
                  <Routes>
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/itinerary" element={<Itinerary />} />
                    <Route path="/mobility" element={<Mobility />} />
                    <Route path="/safety-weather" element={<SafetyWeather />} />
                    <Route path="/crowd" element={<CrowdAlternatives />} />
                    <Route path="/city-reports" element={<CityReports />} />
                    <Route path="*" element={<Navigate to="/onboarding" replace />} />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
      </TripProvider>
    </BusinessAuthProvider>
  )
}
