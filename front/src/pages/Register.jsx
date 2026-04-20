import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api/auth'
import styles from './Register.module.css'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    try {
      const { error: err } = await register(email, password)
      if (err) { setError(err); return }
      navigate('/login')
    } catch {
      setError('Erreur de connexion au serveur.')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1>Inscription</h1>
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
          <label>
            Confirmer le mot de passe
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </label>
          <button type="submit" className={styles.btn}>S'inscrire</button>
        </form>
        <p className={styles.link}>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  )
}
