import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../api/parkings', () => ({
  getParkingById: vi.fn(),
}))
vi.mock('../api/reservations', () => ({
  createReservation: vi.fn(),
}))

// Remplace DateTimePicker par un input datetime-local classique
// pour tester la logique de ParkingDetail indépendamment du widget
vi.mock('../components/DateTimePicker/DateTimePicker', () => ({
  default: ({ value, onChange, label, id, min }) => (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="datetime-local"
        value={value ?? ''}
        min={min}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  ),
}))

const { getParkingById } = await import('../api/parkings')
const { createReservation } = await import('../api/reservations')

// Import après les mocks
const { default: ParkingDetail } = await import('../pages/user/ParkingDetail')

const PARKING = {
  id: 1,
  name: 'Parking Test',
  address: '12 rue de la Paix',
  spots: [
    { id: 10, number: 'A1' },
    { id: 11, number: 'A2' },
  ],
}

function renderParkingDetail() {
  return render(
    <MemoryRouter initialEntries={['/user/parkings/1']}>
      <Routes>
        <Route path="/user/parkings/:id" element={<ParkingDetail />} />
        <Route path="/user/reservations/:id" element={<div>Réservation créée</div>} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ParkingDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getParkingById.mockResolvedValue({ data: PARKING, error: null })
  })

  it('affiche le nom et l\'adresse du parking', async () => {
    renderParkingDetail()
    await waitFor(() => expect(screen.getByText('Parking Test')).toBeInTheDocument())
    expect(screen.getByText('12 rue de la Paix')).toBeInTheDocument()
  })

  it('affiche les places disponibles', async () => {
    renderParkingDetail()
    await waitFor(() => expect(screen.getByText('A1')).toBeInTheDocument())
    expect(screen.getByText('A2')).toBeInTheDocument()
  })

  it('preset 1h ajuste la date de fin à startDate + 1h', async () => {
    renderParkingDetail()
    await waitFor(() => screen.getByRole('button', { name: '1h' }))

    const startInput = screen.getByLabelText('Arrivée')
    await userEvent.click(screen.getByRole('button', { name: '1h' }))

    const endInput = screen.getByLabelText('Départ')
    const diff = new Date(endInput.value) - new Date(startInput.value)
    expect(diff).toBe(60 * 60 * 1000)
  })

  it('preset Journée ajuste à startDate + 8h', async () => {
    renderParkingDetail()
    await waitFor(() => screen.getByRole('button', { name: 'Journée' }))

    await userEvent.click(screen.getByRole('button', { name: 'Journée' }))

    const startInput = screen.getByLabelText('Arrivée')
    const endInput = screen.getByLabelText('Départ')
    const diff = new Date(endInput.value) - new Date(startInput.value)
    expect(diff).toBe(8 * 60 * 60 * 1000)
  })

  it('affiche un badge de durée dynamique', async () => {
    renderParkingDetail()
    await waitFor(() => screen.getByRole('button', { name: '2h' }))
    await userEvent.click(screen.getByRole('button', { name: '2h' }))
    const badge = await screen.findByText(/Durée/)
    expect(badge).toBeInTheDocument()
    expect(badge.textContent).toContain('2h')
  })

  it('bouton submit désactivé si aucune place sélectionnée', async () => {
    renderParkingDetail()
    await waitFor(() => screen.getByText('Confirmer la réservation'))
    expect(screen.getByText('Confirmer la réservation')).toBeDisabled()
  })

  it('bouton submit actif après sélection d\'une place', async () => {
    renderParkingDetail()
    await waitFor(() => screen.getByText('A1'))
    await userEvent.click(screen.getByText('A1'))
    expect(screen.getByText('Confirmer la réservation')).not.toBeDisabled()
  })

  it('affiche une erreur si fin <= début', async () => {
    renderParkingDetail()
    await waitFor(() => screen.getByLabelText('Arrivée'))

    const startInput = screen.getByLabelText('Arrivée')
    const endInput = screen.getByLabelText('Départ')

    await userEvent.clear(endInput)
    await userEvent.type(endInput, startInput.value)

    await waitFor(() =>
      expect(screen.getByText('La fin doit être après le début.')).toBeInTheDocument()
    )
  })

  it('appelle createReservation avec les bons paramètres', async () => {
    createReservation.mockResolvedValue({ data: { id: 42 }, error: null })
    renderParkingDetail()

    await waitFor(() => screen.getByText('A1'))
    await userEvent.click(screen.getByText('A1'))
    await userEvent.click(screen.getByText('Confirmer la réservation'))

    await waitFor(() => expect(createReservation).toHaveBeenCalledOnce())
    const arg = createReservation.mock.calls[0][0]
    expect(arg.spotId).toBe(10)
    expect(arg.startDate).toBeDefined()
    expect(arg.endDate).toBeDefined()
  })
})
