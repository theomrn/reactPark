import { describe, it, expect, vi, beforeEach } from 'vitest'
import jwt from 'jsonwebtoken'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const SECRET = 'test-secret-key-for-vitest'

function mockRes() {
  const res = {}
  res.status = vi.fn().mockReturnValue(res)
  res.json = vi.fn().mockReturnValue(res)
  return res
}

describe('requireAuth', () => {
  it('401 si pas de header Authorization', () => {
    const req = { headers: {} }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ data: null, error: 'Token manquant.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('401 si header ne commence pas par Bearer', () => {
    const req = { headers: { authorization: 'Basic abc123' } }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('401 si token invalide', () => {
    const req = { headers: { authorization: 'Bearer invalid.token.here' } }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ data: null, error: 'Token invalide ou expiré.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('401 si token expiré', () => {
    const token = jwt.sign({ id: 1, email: 'a@a.com', role: 'USER' }, SECRET, { expiresIn: '0s' })
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('appelle next() et injecte req.user si token valide', () => {
    const payload = { id: 1, email: 'a@a.com', role: 'USER' }
    const token = jwt.sign(payload, SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = vi.fn()

    requireAuth(req, res, next)

    expect(next).toHaveBeenCalledOnce()
    expect(req.user.id).toBe(1)
    expect(req.user.role).toBe('USER')
  })
})

describe('requireAdmin', () => {
  it('403 si role USER', () => {
    const token = jwt.sign({ id: 1, email: 'a@a.com', role: 'USER' }, SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = vi.fn()

    requireAdmin(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({ data: null, error: 'Accès réservé aux administrateurs.' })
    expect(next).not.toHaveBeenCalled()
  })

  it('appelle next() si role ADMIN', () => {
    const token = jwt.sign({ id: 2, email: 'admin@a.com', role: 'ADMIN' }, SECRET)
    const req = { headers: { authorization: `Bearer ${token}` } }
    const res = mockRes()
    const next = vi.fn()

    requireAdmin(req, res, next)

    expect(next).toHaveBeenCalledOnce()
  })
})
