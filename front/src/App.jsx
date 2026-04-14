import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ParkingList from './pages/user/ParkingList'
import ParkingDetail from './pages/user/ParkingDetail'
import ReservationList from './pages/user/ReservationList'
import ReservationDetail from './pages/user/ReservationDetail'
import AdminParkings from './pages/admin/AdminParkings'
import ParkingForm from './pages/admin/ParkingForm'
import ParkingMap from './pages/admin/ParkingMap'
import AdminStats from './pages/admin/AdminStats'
import GuidancePage from './pages/GuidancePage'
import PWAInstallBanner from './components/PWAInstallBanner'

function HomeRoute() {
  const { user } = useAuth()
  if (!user) return <Home />
  return <Navigate to={user.role === 'ADMIN' ? '/admin/parkings' : '/user/parkings'} replace />
}

function AppRoutes() {
  const location = useLocation()
  const isGuide = location.pathname.startsWith('/guide/')

  return (
    <>
      {!isGuide && <Navbar />}
      <PWAInstallBanner />
      <Routes>
        <Route path="/guide/:token" element={<GuidancePage />} />

        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/user/parkings" element={
          <ProtectedRoute allowedRoles={['USER']}><ParkingList /></ProtectedRoute>
        } />
        <Route path="/user/parkings/:id" element={
          <ProtectedRoute allowedRoles={['USER']}><ParkingDetail /></ProtectedRoute>
        } />
        <Route path="/user/reservations" element={
          <ProtectedRoute allowedRoles={['USER']}><ReservationList /></ProtectedRoute>
        } />
        <Route path="/user/reservations/:id" element={
          <ProtectedRoute allowedRoles={['USER']}><ReservationDetail /></ProtectedRoute>
        } />

        <Route path="/admin/parkings" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminParkings /></ProtectedRoute>
        } />
        <Route path="/admin/parkings/new" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><ParkingForm /></ProtectedRoute>
        } />
        <Route path="/admin/parkings/:id/edit" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><ParkingForm /></ProtectedRoute>
        } />
        <Route path="/admin/parkings/:id/map" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><ParkingMap /></ProtectedRoute>
        } />
        <Route path="/admin/stats" element={
          <ProtectedRoute allowedRoles={['ADMIN']}><AdminStats /></ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
