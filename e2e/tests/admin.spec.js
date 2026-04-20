import { test, expect } from '@playwright/test'
import { uniqueEmail } from '../fixtures/auth.js'

async function loginAdmin(page) {
  // Tente de se connecter avec le compte admin par défaut
  // (doit exister dans la base de seed)
  const res = await page.request.post('http://localhost:3002/api/auth/login', {
    data: { email: 'admin@parkwise.fr', password: 'Admin1234!' },
  })
  const body = await res.json()
  if (!body.data) test.skip(true, 'Compte admin introuvable en base')

  const { token, user } = body.data
  await page.goto('/')
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    { token, user }
  )
}

test.describe('Accès protégé admin', () => {
  test('un USER ne peut pas accéder à /admin/parkings', async ({ page }) => {
    const email = uniqueEmail('user')
    const res = await page.request.post('http://localhost:3002/api/auth/register', {
      data: { email, password: 'Test1234!' },
    })
    const { data } = await res.json()
    await page.goto('/')
    await page.evaluate(
      ({ token, user }) => {
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))
      },
      { token: data.token, user: data.user }
    )

    await page.goto('/admin/parkings')
    // Doit être redirigé ou afficher accès refusé
    await expect(page).not.toHaveURL('/admin/parkings')
  })

  test('un visiteur non connecté est redirigé depuis /admin', async ({ page }) => {
    await page.goto('/admin/parkings')
    await expect(page).toHaveURL(/login/, { timeout: 5_000 })
  })
})

test.describe('Gestion admin des parkings', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('voir la liste des parkings en admin', async ({ page }) => {
    await page.goto('/admin/parkings')
    await expect(page.locator('h1')).toBeVisible({ timeout: 8_000 })
  })

  test('créer un parking → apparaît dans la liste', async ({ page }) => {
    await page.goto('/admin/parkings/new')

    const suffix = Date.now()
    await page.getByLabel('Nom').fill(`Parking Test ${suffix}`)
    await page.getByLabel('Adresse').fill('42 rue de Test')
    await page.getByLabel('Nombre de places').fill('10')
    await page.getByRole('button', { name: /Créer|Enregistrer/ }).click()

    await expect(page).toHaveURL('/admin/parkings', { timeout: 8_000 })
    await expect(page.getByText(`Parking Test ${suffix}`)).toBeVisible()
  })

  test('modifier un parking → nom mis à jour', async ({ page }) => {
    const res = await page.request.get('http://localhost:3002/api/parkings')
    const { data: parkings } = await res.json()
    test.skip(parkings.length === 0, 'Aucun parking en base')

    const parkingId = parkings[0].id
    const newName = `Parking Modifié ${Date.now()}`

    await page.goto(`/admin/parkings/${parkingId}/edit`)
    await page.getByLabel('Nom').clear()
    await page.getByLabel('Nom').fill(newName)
    await page.getByRole('button', { name: /Enregistrer/ }).click()

    await expect(page).toHaveURL('/admin/parkings', { timeout: 8_000 })
    await expect(page.getByText(newName)).toBeVisible()
  })
})
