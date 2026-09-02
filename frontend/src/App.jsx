import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import FarmProfilePage from './pages/FarmProfilePage'
import LandAnalysisPage from './pages/LandAnalysisPage'
import SoilReportPage from './pages/SoilReportPage'
import CropAdvisoryPage from './pages/CropAdvisoryPage'
import CropDetailsPage from './pages/CropDetailsPage'
import FarmingPlanPage from './pages/FarmingPlanPage'
import CropDoctorPage from './pages/CropDoctorPage'
import MarketIntelligencePage from './pages/MarketIntelligencePage'
import NearbyServicesPage from './pages/NearbyServicesPage'
import GovernmentSchemesPage from './pages/GovernmentSchemesPage'
import VoiceAssistantPage from './pages/VoiceAssistantPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProtectedRoute from './components/ProtectedRoute'
import OfflineBanner from './components/OfflineBanner'

export default function App() {
  return (
    <>
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/farm-profile" element={<ProtectedRoute><FarmProfilePage /></ProtectedRoute>} />
        <Route path="/land-analysis" element={<ProtectedRoute><LandAnalysisPage /></ProtectedRoute>} />
        <Route path="/soil-report" element={<ProtectedRoute><SoilReportPage /></ProtectedRoute>} />
        <Route path="/crop-advisory" element={<ProtectedRoute><CropAdvisoryPage /></ProtectedRoute>} />
        <Route path="/crop-details/:cropId" element={<ProtectedRoute><CropDetailsPage /></ProtectedRoute>} />
        <Route path="/farming-plan" element={<ProtectedRoute><FarmingPlanPage /></ProtectedRoute>} />
        <Route path="/crop-doctor" element={<ProtectedRoute><CropDoctorPage /></ProtectedRoute>} />
        <Route path="/market" element={<ProtectedRoute><MarketIntelligencePage /></ProtectedRoute>} />
        <Route path="/services" element={<ProtectedRoute><NearbyServicesPage /></ProtectedRoute>} />
        <Route path="/schemes" element={<ProtectedRoute><GovernmentSchemesPage /></ProtectedRoute>} />
        <Route path="/voice-assistant" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
