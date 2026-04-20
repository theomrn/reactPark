import { test, expect } from '@playwright/test'
import { uniqueEmail } from '../fixtures/auth.js'

/**
 * Helper : inscription + connexion (register redirige vers /login).
 */
async function registerAndLogin(page, email, password) {
  await page.goto('/register')
  await page.fill('input[type="email"]', email)
  const passwordFields = page.locator('input[type="password"]')
  await passwordFields.nth(0).fill(password)
  await passwordFields.nth(1).fill(password)
  await page.click('button[type="submit"]')

  // Register redirige vers /login
  await page.waitForURL('/login', { timeout: 8_000 })

  await page.fill('input[type="email"]', email)
  await page.locator('input[type="password"]').fill(password)
  await page.click('button[type="submit"]')

  await page.waitForURL('/user/parkings', { timeout: 8_000 })
}

test.describe('Authentification', () => {
  test('inscription + login → redirigé vers /user/parkings', async ({ page }) => {
    const email = uniqueEmail('register')
    await registerAndLogin(page, email, 'Test1234!')

    await expect(page).toHaveURL('/user/parkings')
    await expect(page.locator('text=Déconnexion')).toBeVisible()
  })

  test('inscription avec email déjà utilisé → message d\'erreur', async ({ page }) => {
    const email = uniqueEmail('dup')

    // Premier enregistrement
    await page.goto('/register')
    const passwordFields = page.locator('input[type="password"]')
    await page.fill('input[type="email"]', email)
    await passwordFields.nth(0).fill('Test1234!')
    await passwordFields.nth(1).fill('Test1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/login')

    // Tentative de ré-inscription avec le même email
    await page.goto('/register')
    await page.fill('input[type="email"]', email)
    await page.locator('input[type="password"]').nth(0).fill('Test1234!')
    await page.locator('input[type="password"]').nth(1).fill('Test1234!')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=déjà utilisé')).toBeVisible({ timeout: 8_000 })
  })

  test('login valide → navbar affiche Déconnexion', async ({ page }) => {
    const email = uniqueEmail('login')

    // Créer le compte
    await page.goto('/register')
    const passwordFields = page.locator('input[type="password"]')
    await page.fill('input[type="email"]', email)
    await passwordFields.nth(0).fill('Test1234!')
    await passwordFields.nth(1).fill('Test1234!')
    await page.click('button[type="submit"]')
    await page.waitForURL('/login')

    // Login
    await page.fill('input[type="email"]', email)
    await page.locator('input[type="password"]').fill('Test1234!')
    await page.click('button[type="submit"]')

    await expect(page).toHaveURL('/user/parkings')
    await expect(page.locator('button:has-text("Déconnexion")')).toBeVisible()
  })

  test('login avec mauvais mot de passe → message d\'erreur', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'nobody@nowhere.com')
    await page.locator('input[type="password"]').fill('wrongpass')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=incorrect')).toBeVisible({ timeout: 8_000 })
  })

  test('logout → retour sur /login', async ({ page }) => {
    const email = uniqueEmail('logout')
    await registerAndLogin(page, email, 'Test1234!')

    await page.click('button:has-text("Déconnexion")')
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('button', { name: 'Se connecter' })).toBeVisible()
  })
})
