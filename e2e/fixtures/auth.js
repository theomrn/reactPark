/**
 * Helper pour authentifier un utilisateur via l'API et injecter le token
 * dans localStorage avant de naviguer.
 */
export async function loginAs(page, email, password) {
  const res = await page.request.post('http://localhost:3002/api/auth/login', {
    data: { email, password },
  })
  const body = await res.json()
  const { token, user } = body.data

  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    { token, user }
  )

  return { token, user }
}

/**
 * Crée un compte de test unique et retourne ses credentials.
 */
export function uniqueEmail(prefix = 'test') {
  return `${prefix}_${Date.now()}@parkwise-test.com`
}
