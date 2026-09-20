import { Routes, Route } from 'react-router-dom'
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

export default function App() {
  return (
    <TripProvider>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />
        {/* Login / Sign Up / Guest */}
        <Route path="/login" element={<Login />} />
        <Route path="/role" element={<RoleSelection />} />

        {/* Existing Yatra360 application */}
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
                </Routes>
              </main>
            </div>
          }
        />
      </Routes>
    </TripProvider>
  )
}