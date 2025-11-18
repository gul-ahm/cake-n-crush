import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { applyTheme, getSavedTheme } from './utils/theme'
import App from './App'
import Home from './pages/Home'
import Portfolio from './pages/Portfolio'
import CakeDetail from './pages/CakeDetail'
import FindUs from './pages/FindUs'
import SecureLogin from './pages/SecureLogin'
import AdminDashboard from './pages/AdminDashboard'
import SecureRouteGuard from './components/guards/SecureRouteGuard'
import secureAuth from './services/secureAuth'

// Apply saved theme at startup
applyTheme(getSavedTheme())

// Get obfuscated admin route from environment
const secureAdminRoute = import.meta.env.VITE_ACCESS_ROUTE || 's3cur3-m4n4g3m3nt-p0rt4l-x9z'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'portfolio/:id', element: <CakeDetail /> },
      { path: 'find-us', element: <FindUs /> },
      { 
        path: 'login', 
        element: <SecureLogin /> 
      },
      {
        path: secureAdminRoute,
        element: (
          <SecureRouteGuard>
            <AdminDashboard />
          </SecureRouteGuard>
        ),
      },
      // Legacy admin routes redirect to login
      { 
        path: 'admin', 
        element: <SecureLogin /> 
      },
      { 
        path: 'secure-admin-portal-2024', 
        element: <SecureLogin /> 
      },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
