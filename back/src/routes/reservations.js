import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/mine', requireAuth, async (req, res) => {
  const reservations = await prisma.reservation.findMany({
    where: { userId: req.user.id },
    include: {
      spot: { include: { parking: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return res.json({ data: reservations, error: null })
})

router.post('/', requireAuth, async (req, res) => {
  const { spotId, startDate, endDate } = req.body

  if (!spotId || !startDate || !endDate) {
    return res.status(400).json({ data: null, error: 'spotId, startDate et endDate sont requis.' })
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start) || isNaN(end) || end <= start) {
    return res.status(400).json({ data: null, error: 'Dates invalides.' })
  }

  const spot = await prisma.spot.findUnique({ where: { id: parseInt(spotId) } })
  if (!spot) {
    return res.status(400).json({ data: null, error: 'Place introuvable.' })
  }

  const conflict = await prisma.reservation.findFirst({
    where: {
      spotId: parseInt(spotId),
      status: 'ACTIVE',
      AND: [
        { startDate: { lt: end } },
        { endDate: { gt: start } },
      ],
    },
  })

  if (conflict) {
    return res.status(400).json({ data: null, error: 'Cette place est déjà réservée sur ce créneau.' })
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId: req.user.id,
      spotId: parseInt(spotId),
      startDate: start,
      endDate: end,
      qrToken: crypto.randomUUID(),
      status: 'ACTIVE',
    },
    include: {
      spot: { include: { parking: true } },
    },
  })

  return res.status(201).json({ data: reservation, error: null })
})

router.delete('/:id', requireAuth, async (req, res) => {
  const id = parseInt(req.params.id)

  const reservation = await prisma.reservation.findUnique({ where: { id } })
  if (!reservation) {
    return res.status(404).json({ data: null, error: 'Réservation introuvable.' })
  }

  if (reservation.userId !== req.user.id) {
    return res.status(403).json({ data: null, error: 'Accès refusé.' })
  }

  if (reservation.status !== 'ACTIVE') {
    return res.status(400).json({ data: null, error: 'Cette réservation ne peut pas être annulée.' })
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })

  return res.json({ data: updated, error: null })
})

export default router
