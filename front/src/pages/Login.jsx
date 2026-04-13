import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../api/auth'
import styles from './Login.module.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const { login: loginCtx } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    try {
      const { data, error: err } = await login(email, password)
      if (err) { setError(err); return }
      loginCtx(data.token, data.user)
      navigate(data.user.role === 'ADMIN' ? '/admin/parkings' : '/user/parkings')
    } catch {
      setError('Erreur de connexion au serveur.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Connexion</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          <label>
            Mot de passe
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          <button type="submit" className={styles.btn}>Se connecter</button>
        </form>
        <p className={styles.link}>Pas de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>
    </div>
  )
}
