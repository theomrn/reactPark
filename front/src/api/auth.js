import client from './client'

export async function login(email, password) {
  try {
    const res = await client.post('/api/auth/login', { email, password })
    return res.data
  } catch (err) {
    const message = err.response?.data?.message || 'Email ou mot de passe incorrect.'
    return { error: message }
  }
}

export async function register(email, password) {
  try {
    const res = await client.post('/api/auth/register', { email, password })
    return res.data
  } catch (err) {
    const message = err.response?.data?.error || 'Erreur de connexion au serveur.'
    return { data: null, error: message }
  }
}
