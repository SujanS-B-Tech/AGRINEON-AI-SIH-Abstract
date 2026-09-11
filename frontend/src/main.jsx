import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { OfflineProvider } from './context/OfflineContext'
import { registerSW } from 'virtual:pwa-register'
import './index.css'

// Register service worker for offline support
registerSW({ immediate: true })


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <OfflineProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </OfflineProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
