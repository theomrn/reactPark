import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../context/AuthContext'

function TestConsumer() {
  const { user, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="user">{user ? user.email : 'none'}</span>
      <button onClick={() => login('tok123', { id: 1, email: 'a@a.com', role: 'USER' })}>login</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function renderWithAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  )
}

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear())

  it('user est null par défaut', () => {
    renderWithAuth()
    expect(screen.getByTestId('user').textContent).toBe('none')
  })

  it('login() met à jour user et persiste dans localStorage', async () => {
    renderWithAuth()
    await userEvent.click(screen.getByText('login'))

    expect(screen.getByTestId('user').textContent).toBe('a@a.com')
    expect(localStorage.getItem('token')).toBe('tok123')
    expect(JSON.parse(localStorage.getItem('user')).email).toBe('a@a.com')
  })

  it('logout() remet user à null et vide localStorage', async () => {
    renderWithAuth()
    await userEvent.click(screen.getByText('login'))
    await userEvent.click(screen.getByText('logout'))

    expect(screen.getByTestId('user').textContent).toBe('none')
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('restaure user depuis localStorage au montage', () => {
    localStorage.setItem('user', JSON.stringify({ id: 2, email: 'stored@a.com', role: 'USER' }))
    renderWithAuth()
    expect(screen.getByTestId('user').textContent).toBe('stored@a.com')
  })
})
