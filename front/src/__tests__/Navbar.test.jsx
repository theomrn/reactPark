import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import Navbar from '../components/Navbar/Navbar'

// AuthContext exporte AuthContext (named) — on le fournit manuellement
function renderNavbar(user, logout = vi.fn()) {
  return render(
    <AuthContext.Provider value={{ user, logout }}>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('Navbar — non connecté', () => {
  it('affiche "Se connecter"', () => {
    renderNavbar(null)
    expect(screen.getByText('Se connecter')).toBeInTheDocument()
  })

  it('n\'affiche pas "Déconnexion"', () => {
    renderNavbar(null)
    expect(screen.queryByText('Déconnexion')).not.toBeInTheDocument()
  })
})

describe('Navbar — role USER', () => {
  const user = { id: 1, email: 'u@u.com', role: 'USER' }

  it('affiche "Parkings"', () => {
    renderNavbar(user)
    expect(screen.getByText('Parkings')).toBeInTheDocument()
  })

  it('affiche "Mes réservations"', () => {
    renderNavbar(user)
    expect(screen.getByText('Mes réservations')).toBeInTheDocument()
  })

  it('n\'affiche pas les liens admin', () => {
    renderNavbar(user)
    expect(screen.queryByText('Gestion parkings')).not.toBeInTheDocument()
    expect(screen.queryByText('Statistiques')).not.toBeInTheDocument()
  })

  it('affiche "Déconnexion"', () => {
    renderNavbar(user)
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
  })
})

describe('Navbar — role ADMIN', () => {
  const admin = { id: 2, email: 'admin@a.com', role: 'ADMIN' }

  it('affiche "Gestion parkings" et "Statistiques"', () => {
    renderNavbar(admin)
    expect(screen.getByText('Gestion parkings')).toBeInTheDocument()
    expect(screen.getByText('Statistiques')).toBeInTheDocument()
  })

  it('n\'affiche pas les liens USER', () => {
    renderNavbar(admin)
    expect(screen.queryByText('Parkings')).not.toBeInTheDocument()
    expect(screen.queryByText('Mes réservations')).not.toBeInTheDocument()
  })

  it('appelle logout() au clic sur "Déconnexion"', async () => {
    const logout = vi.fn()
    renderNavbar(admin, logout)
    await userEvent.click(screen.getByText('Déconnexion'))
    expect(logout).toHaveBeenCalledOnce()
  })
})
