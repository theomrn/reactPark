import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma.js'

const router = Router()

function signToken({ id, email, role }) {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'Email et mot de passe requis.' })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return res.status(400).json({ data: null, error: 'Cet email est déjà utilisé.' })
  }

  const hashed = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: { email, password: hashed },
    select: { id: true, email: true, role: true },
  })

  const token = signToken(user)
  return res.status(201).json({ data: { token, user }, error: null })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ data: null, error: 'Email et mot de passe requis.' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ data: null, error: 'Email ou mot de passe incorrect.' })
  }

  const valid = await bcrypt.compare(password, user.password)
  if (!valid) {
    return res.status(401).json({ data: null, error: 'Email ou mot de passe incorrect.' })
  }

  const payload = { id: user.id, email: user.email, role: user.role }
  const token = signToken(payload)
  return res.json({ data: { token, user: payload }, error: null })
})

export default router
