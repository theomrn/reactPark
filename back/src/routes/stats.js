import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAdmin } from '../middleware/auth.js'
import { wrap } from '../lib/asyncHandler.js'

const router = Router()

router.get('/parkings', requireAdmin, wrap(async (req, res) => {
  const parkings = await prisma.parking.findMany({
    include: {
      _count: { select: { spots: { where: { reservations: { some: { status: 'ACTIVE' } } } } } },
    },
  })

  const data = parkings.map(p => {
    const occupied = p._count.spots
    const occupancyRate = p.totalSpots > 0 ? Math.round((occupied / p.totalSpots) * 100) : 0
    return { id: p.id, name: p.name, totalSpots: p.totalSpots, occupied, occupancyRate }
  })

  return res.json({ data, error: null })
}))

router.get('/reservations', requireAdmin, wrap(async (req, res) => {
  const since = new Date()
  since.setDate(since.getDate() - 29)
  since.setHours(0, 0, 0, 0)

  const reservations = await prisma.reservation.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
  })

  const counts = {}
  for (let i = 0; i < 30; i++) {
    const d = new Date(since)
    d.setDate(d.getDate() + i)
    const key = d.toISOString().slice(0, 10)
    counts[key] = 0
  }

  for (const r of reservations) {
    const key = r.createdAt.toISOString().slice(0, 10)
    if (key in counts) counts[key]++
  }

  const data = Object.entries(counts).map(([date, count]) => ({ date, count }))
  return res.json({ data, error: null })
}))

export default router
