import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  function handleLogout() {
    logout()
    navigate('/')
  }

  function linkClass(to) {
    return `${styles.navLink} ${pathname.startsWith(to) ? styles.active : ''}`
  }

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.brand}>
        <img src="/logo-bg.png" alt="" className={styles.logo} />
      </Link>
      <div className={styles.links}>
        {user?.role === 'USER' && (
          <>
            <Link to="/user/parkings" className={linkClass('/user/parkings')}>Parkings</Link>
            <Link to="/user/reservations" className={linkClass('/user/reservations')}>Mes réservations</Link>
          </>
        )}
        {user?.role === 'ADMIN' && (
          <>
            <Link to="/admin/parkings" className={linkClass('/admin/parkings')}>Gestion parkings</Link>
            <Link to="/admin/stats" className={linkClass('/admin/stats')}>Statistiques</Link>
          </>
        )}
        {user ? (
          <button onClick={handleLogout} className={styles.logout}>
            Déconnexion
          </button>
        ) : (
          <Link to="/login" className={styles.loginBtn}>Se connecter</Link>
        )}
      </div>
    </nav>
  )
}
