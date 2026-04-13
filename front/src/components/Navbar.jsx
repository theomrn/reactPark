import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav className={styles.nav}>
      <span className={styles.brand}>ParkingApp</span>
      <div className={styles.links}>
        {user?.role === 'USER' && (
          <>
            <Link to="/user/parkings">Parkings</Link>
            <Link to="/user/reservations">Mes réservations</Link>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/parkings">Gestion parkings</Link>
            <Link to="/admin/stats">Statistiques</Link>
          </>
        )}
        {user && (
          <button onClick={handleLogout} className={styles.logout}>
            Déconnexion
          </button>
        )}
      </div>
    </nav>
  )
}
