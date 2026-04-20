import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

vi.mock('../lib/prisma.js', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}))

const { default: prisma } = await import('../lib/prisma.js')
const { default: bcrypt } = await import('bcrypt')
const { default: app } = await import('../app.js')

describe('POST /api/auth/register', () => {
  beforeEach(() => vi.clearAllMocks())

  it('201 + token si email et password OK', async () => {
    prisma.user.findUnique.mockResolvedValue(null)
    prisma.user.create.mockResolvedValue({ id: 1, email: 'test@test.com', role: 'USER' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })

    expect(res.status).toBe(201)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.data.user.email).toBe('test@test.com')
    expect(res.body.error).toBeNull()
  })

  it('400 si email manquant', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ password: 'password123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Email et mot de passe requis.')
  })

  it('400 si password manquant', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Email et mot de passe requis.')
  })

  it('400 si email déjà utilisé', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1, email: 'test@test.com' })

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com', password: 'password123' })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cet email est déjà utilisé.')
  })
})

describe('POST /api/auth/login', () => {
  beforeEach(() => vi.clearAllMocks())

  it('200 + token si credentials valides', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      role: 'USER',
      password: 'hashed_password',
    })
    bcrypt.compare.mockResolvedValue(true)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.data.token).toBeDefined()
    expect(res.body.error).toBeNull()
  })

  it('401 si email inconnu', async () => {
    prisma.user.findUnique.mockResolvedValue(null)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'unknown@test.com', password: 'password123' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Email ou mot de passe incorrect.')
  })

  it('401 si mauvais mot de passe', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 1,
      email: 'test@test.com',
      role: 'USER',
      password: 'hashed_password',
    })
    bcrypt.compare.mockResolvedValue(false)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body.error).toBe('Email ou mot de passe incorrect.')
  })

  it('400 si champs manquants', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Email et mot de passe requis.')
  })
})
