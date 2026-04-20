import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAdmin } from '../middleware/auth.js'
import { wrap } from '../lib/asyncHandler.js'

const router = Router()

router.param('id', (req, res, next, val) => {
  req.params.id = parseInt(val, 10)
  if (isNaN(req.params.id)) return res.status(400).json({ data: null, error: 'ID invalide.' })
  next()
})

function notFound(res, label = 'Ressource') {
  return res.status(404).json({ data: null, error: `${label} introuvable.` })
}

router.get('/', wrap(async (req, res) => {
  const parkings = await prisma.parking.findMany({
    include: {
      _count: { select: { spots: { where: { reservations: { none: { status: 'ACTIVE' } } } } } },
    },
  })

  const data = parkings.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    totalSpots: p.totalSpots,
    availableSpots: p._count.spots,
  }))

  return res.json({ data, error: null })
}))

router.get('/:id', wrap(async (req, res) => {
  const { id } = req.params
  const now = new Date()
  const parking = await prisma.parking.findUnique({
    where: { id },
    include: {
      spots: {
        include: {
          reservations: {
            where: { status: 'ACTIVE', endDate: { gt: now } },
            select: { id: true },
          },
        },
      },
    },
  })

  if (!parking) return notFound(res, 'Parking')

  const data = {
    ...parking,
    spots: parking.spots.map(({ reservations, ...s }) => ({
      ...s,
      isAvailable: reservations.length === 0,
    })),
  }

  return res.json({ data, error: null })
}))

router.post('/', requireAdmin, wrap(async (req, res) => {
  const { name, address, totalSpots, cols: rawCols } = req.body
  if (!name || !address || !totalSpots || totalSpots < 1) {
    return res.status(400).json({ data: null, error: 'Nom, adresse et nombre de places requis.' })
  }

  const n = parseInt(totalSpots)
  const cols = Math.max(1, parseInt(rawCols) || 5)

  const parking = await prisma.parking.create({
    data: {
      name,
      address,
      totalSpots: n,
      cols,
      entranceCol: Math.floor(cols / 2),
      entranceRow: 0,
      spots: {
        create: Array.from({ length: n }, (_, i) => ({
          number: String(i + 1),
          col: i % cols,
          row: Math.floor(i / cols),
        })),
      },
    },
    include: { spots: true },
  })

  return res.status(201).json({ data: parking, error: null })
}))

router.put('/:id', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params
  const { name, address } = req.body
  try {
    const parking = await prisma.parking.update({ where: { id }, data: { name, address } })
    return res.json({ data: parking, error: null })
  } catch (e) {
    if (e.code === 'P2025') return notFound(res, 'Parking')
    throw e
  }
}))

router.put('/:id/map', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params
  const { cols, entranceCol, entranceRow, spots } = req.body

  if (typeof cols !== 'number' || typeof entranceCol !== 'number' || typeof entranceRow !== 'number') {
    return res.status(400).json({ data: null, error: 'cols, entranceCol et entranceRow sont requis.' })
  }

  try {
    await prisma.$transaction([
      prisma.parking.update({ where: { id }, data: { cols, entranceCol, entranceRow } }),
      ...spots.map(s => prisma.spot.update({ where: { id: s.id }, data: { col: s.col, row: s.row } })),
    ])

    const parking = await prisma.parking.findUnique({
      where: { id },
      include: { spots: true },
    })

    return res.json({ data: parking, error: null })
  } catch (e) {
    if (e.code === 'P2025') return notFound(res, 'Parking')
    throw e
  }
}))

router.delete('/:id', requireAdmin, wrap(async (req, res) => {
  const { id } = req.params
  try {
    await prisma.$transaction([
      prisma.reservation.deleteMany({ where: { spot: { parkingId: id } } }),
      prisma.spot.deleteMany({ where: { parkingId: id } }),
      prisma.parking.delete({ where: { id } }),
    ])
    return res.json({ data: { id }, error: null })
  } catch (e) {
    if (e.code === 'P2025') return notFound(res, 'Parking')
    throw e
  }
}))

export default router
