import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

vi.mock('../lib/prisma.js', () => ({
  default: {
    reservation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    spot: {
      findUnique: vi.fn(),
    },
  },
}))

const { default: prisma } = await import('../lib/prisma.js')
const { default: app } = await import('../app.js')

const SECRET = 'test-secret-key-for-vitest'

function makeToken(overrides = {}) {
  return jwt.sign(
    { id: 1, email: 'user@test.com', role: 'USER', ...overrides },
    SECRET
  )
}

const USER_TOKEN = makeToken()
const OTHER_TOKEN = makeToken({ id: 2, email: 'other@test.com' })

const SPOT = { id: 10, number: 'A1', parkingId: 1 }
const RES_BASE = {
  id: 100,
  userId: 1,
  spotId: 10,
  startDate: new Date('2026-05-01T10:00:00Z'),
  endDate: new Date('2026-05-01T12:00:00Z'),
  qrToken: 'some-uuid',
  status: 'ACTIVE',
  spot: { ...SPOT, parking: { id: 1, name: 'Test Parking' } },
}

describe('GET /api/reservations/mine', () => {
  beforeEach(() => vi.clearAllMocks())

  it('401 sans token', async () => {
    const res = await request(app).get('/api/reservations/mine')
    expect(res.status).toBe(401)
  })

  it('200 + liste des réservations de l\'utilisateur', async () => {
    prisma.reservation.findMany.mockResolvedValue([RES_BASE])

    const res = await request(app)
      .get('/api/reservations/mine')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].id).toBe(100)
  })
})

describe('GET /api/reservations/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 si la réservation appartient à l\'utilisateur', async () => {
    prisma.reservation.findUnique.mockResolvedValue(RES_BASE)

    const res = await request(app)
      .get('/api/reservations/100')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(100)
  })

  it('404 si la réservation appartient à un autre utilisateur', async () => {
    prisma.reservation.findUnique.mockResolvedValue(RES_BASE)

    const res = await request(app)
      .get('/api/reservations/100')
      .set('Authorization', `Bearer ${OTHER_TOKEN}`)

    expect(res.status).toBe(404)
  })

  it('404 si réservation inexistante', async () => {
    prisma.reservation.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .get('/api/reservations/999')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(404)
  })

  it('400 si id non numérique', async () => {
    const res = await request(app)
      .get('/api/reservations/abc')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('ID invalide.')
  })
})

describe('POST /api/reservations', () => {
  beforeEach(() => vi.clearAllMocks())

  const FUTURE_START = '2026-06-01T10:00:00Z'
  const FUTURE_END = '2026-06-01T12:00:00Z'

  it('201 si créneau libre', async () => {
    prisma.spot.findUnique.mockResolvedValue(SPOT)
    prisma.reservation.findFirst.mockResolvedValue(null)
    prisma.reservation.create.mockResolvedValue(RES_BASE)

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ spotId: 10, startDate: FUTURE_START, endDate: FUTURE_END })

    expect(res.status).toBe(201)
    expect(res.body.data.qrToken).toBeDefined()
  })

  it('400 si créneau en conflit', async () => {
    prisma.spot.findUnique.mockResolvedValue(SPOT)
    prisma.reservation.findFirst.mockResolvedValue(RES_BASE)

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ spotId: 10, startDate: FUTURE_START, endDate: FUTURE_END })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cette place est déjà réservée sur ce créneau.')
  })

  it('400 si fin <= début', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ spotId: 10, startDate: FUTURE_END, endDate: FUTURE_START })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Dates invalides.')
  })

  it('400 si spotId manquant', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ startDate: FUTURE_START, endDate: FUTURE_END })

    expect(res.status).toBe(400)
    expect(res.body.error).toMatch(/requis/)
  })

  it('400 si place introuvable', async () => {
    prisma.spot.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/reservations')
      .set('Authorization', `Bearer ${USER_TOKEN}`)
      .send({ spotId: 999, startDate: FUTURE_START, endDate: FUTURE_END })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Place introuvable.')
  })

  it('401 sans token', async () => {
    const res = await request(app)
      .post('/api/reservations')
      .send({ spotId: 10, startDate: FUTURE_START, endDate: FUTURE_END })

    expect(res.status).toBe(401)
  })
})

describe('DELETE /api/reservations/:id', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 si propriétaire et statut ACTIVE', async () => {
    prisma.reservation.findUnique.mockResolvedValue(RES_BASE)
    prisma.reservation.update.mockResolvedValue({ ...RES_BASE, status: 'CANCELLED' })

    const res = await request(app)
      .delete('/api/reservations/100')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(200)
  })

  it('403 si pas le propriétaire', async () => {
    prisma.reservation.findUnique.mockResolvedValue(RES_BASE)

    const res = await request(app)
      .delete('/api/reservations/100')
      .set('Authorization', `Bearer ${OTHER_TOKEN}`)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('Accès refusé.')
  })

  it('400 si statut != ACTIVE', async () => {
    prisma.reservation.findUnique.mockResolvedValue({ ...RES_BASE, status: 'CANCELLED' })

    const res = await request(app)
      .delete('/api/reservations/100')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cette réservation ne peut pas être annulée.')
  })

  it('404 si réservation introuvable', async () => {
    prisma.reservation.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .delete('/api/reservations/999')
      .set('Authorization', `Bearer ${USER_TOKEN}`)

    expect(res.status).toBe(404)
  })
})
