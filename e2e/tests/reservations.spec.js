import { test, expect } from '@playwright/test'
import { uniqueEmail } from '../fixtures/auth.js'

async function createAccountAndInjectToken(page) {
  const email = uniqueEmail('resa')
  const res = await page.request.post('http://localhost:3002/api/auth/register', {
    data: { email, password: 'Test1234!' },
  })
  const { data } = await res.json()

  // Injecter le token avant la navigation pour que React le lise au montage
  await page.goto('/')
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    { token: data.token, user: data.user }
  )
}

test.describe('Réservations — parcours utilisateur', () => {
  test.beforeEach(async ({ page }) => {
    await createAccountAndInjectToken(page)
  })

  test('accéder à la liste des parkings', async ({ page }) => {
    await page.goto('/user/parkings')
    await expect(page.getByRole('heading')).toBeVisible({ timeout: 8_000 })
  })

  test('sélectionner un parking → voir ses places', async ({ page }) => {
    await page.goto('/user/parkings')

    const firstParking = page.locator('a[href^="/user/parkings/"]').first()
    await expect(firstParking).toBeVisible({ timeout: 8_000 })
    await firstParking.click()

    await expect(page.getByText('Choisir la période')).toBeVisible()
    await expect(page.getByText('Sélectionner une place')).toBeVisible()
  })

  test('créer une réservation → voir le détail avec QR code', async ({ page }) => {
    const parkingsRes = await page.request.get('http://localhost:3002/api/parkings')
    const { data: parkings } = await parkingsRes.json()
    test.skip(parkings.length === 0, 'Aucun parking en base')

    const parkingId = parkings[0].id
    await page.goto(`/user/parkings/${parkingId}`)

    await expect(page.getByText('Sélectionner une place')).toBeVisible({ timeout: 8_000 })

    // Preset 1h
    await page.getByRole('button', { name: '1h' }).click()

    // Sélectionner la première place disponible (non désactivée)
    const firstSpot = page.getByRole('button', { name: /^\d+$/, disabled: false }).first()
    await expect(firstSpot).toBeVisible({ timeout: 5_000 })
    await firstSpot.click()

    // Soumettre
    await page.getByRole('button', { name: 'Confirmer la réservation' }).click()

    await expect(page).toHaveURL(/\/user\/reservations\/\d+/, { timeout: 10_000 })
    await expect(page.getByText('QR Code')).toBeVisible()
  })

  test('voir la liste de mes réservations', async ({ page }) => {
    await page.goto('/user/reservations')
    await expect(page.getByRole('heading', { name: 'Mes réservations' })).toBeVisible({ timeout: 8_000 })
  })
})
