import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../api/reservations', () => ({
  getReservationById: vi.fn(),
}))

// QRDisplay utilise un canvas — on le mocke
vi.mock('../components/QRDisplay', () => ({
  default: ({ value }) => <div data-testid="qr">{value}</div>,
}))

const { getReservationById } = await import('../api/reservations')
const { default: ReservationDetail } = await import('../pages/user/ReservationDetail')

const RESERVATION = {
  id: 42,
  status: 'ACTIVE',
  startDate: '2026-05-01T10:00:00Z',
  endDate: '2026-05-01T12:00:00Z',
  qrToken: 'abc-token-123',
  spot: {
    number: 'B3',
    parking: { name: 'Parking Centre' },
  },
}

function renderReservationDetail(id = '42') {
  return render(
    <MemoryRouter initialEntries={[`/user/reservations/${id}`]}>
      <Routes>
        <Route path="/user/reservations/:id" element={<ReservationDetail />} />
        <Route path="/user/reservations" element={<div>Liste</div>} />
        <Route path="/guide/:token" element={<div>Guidage</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ReservationDetail', () => {
  beforeEach(() => vi.clearAllMocks())

  it('affiche les infos de la réservation', async () => {
    getReservationById.mockResolvedValue({ data: RESERVATION, error: null })
    renderReservationDetail()

    await waitFor(() => expect(screen.getByText('Réservation #42')).toBeInTheDocument())
    expect(screen.getByText('Parking Centre')).toBeInTheDocument()
    expect(screen.getByText('B3')).toBeInTheDocument()
  })

  it('affiche le statut "Active" pour ACTIVE', async () => {
    getReservationById.mockResolvedValue({ data: RESERVATION, error: null })
    renderReservationDetail()

    await waitFor(() => screen.getByText('Réservation #42'))
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('affiche le lien retour vers /user/reservations', async () => {
    getReservationById.mockResolvedValue({ data: RESERVATION, error: null })
    renderReservationDetail()

    await waitFor(() => screen.getByText('← Mes réservations'))
    const back = screen.getByText('← Mes réservations')
    expect(back.closest('a')).toHaveAttribute('href', '/user/reservations')
  })

  it('le bouton "Voir le guidage" pointe vers /guide/:qrToken', async () => {
    getReservationById.mockResolvedValue({ data: RESERVATION, error: null })
    renderReservationDetail()

    await waitFor(() => screen.getByText('Voir le guidage'))
    const link = screen.getByText('Voir le guidage').closest('a')
    expect(link).toHaveAttribute('href', '/guide/abc-token-123')
  })

  it('affiche le QR code avec la bonne valeur', async () => {
    getReservationById.mockResolvedValue({ data: RESERVATION, error: null })
    renderReservationDetail()

    await waitFor(() => screen.getByTestId('qr'))
    expect(screen.getByTestId('qr').textContent).toContain('abc-token-123')
  })

  it('affiche un message d\'erreur si l\'API échoue', async () => {
    getReservationById.mockResolvedValue({ data: null, error: 'Réservation introuvable.' })
    renderReservationDetail()

    await waitFor(() =>
      expect(screen.getByText('Réservation introuvable.')).toBeInTheDocument()
    )
  })
})
