import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Onboarding from './pages/Onboarding'
import Itinerary from './pages/Itinerary'
import Mobility from './pages/Mobility'
import SafetyWeather from './pages/SafetyWeather'
import CrowdAlternatives from './pages/CrowdAlternatives'
import CityReports from './pages/CityReports'
import { TripProvider } from './context/TripContext'

export default function App() {
  return (
    <TripProvider>
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/itinerary" element={<Itinerary />} />
            <Route path="/mobility" element={<Mobility />} />
            <Route path="/safety-weather" element={<SafetyWeather />} />
            <Route path="/crowd" element={<CrowdAlternatives />} />
            <Route path="/city-reports" element={<CityReports />} />
          </Routes>
        </main>
      </div>
    </TripProvider>
  )
}
