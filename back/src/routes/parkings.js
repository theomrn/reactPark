import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const parkings = await prisma.parking.findMany({
    include: { spots: { include: { reservations: { where: { status: 'ACTIVE' } } } } },
  })

  const data = parkings.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    totalSpots: p.totalSpots,
    availableSpots: p.spots.filter(s => s.reservations.length === 0).length,
  }))

  return res.json({ data, error: null })
})

router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id)
  const parking = await prisma.parking.findUnique({
    where: { id },
    include: { spots: true },
  })

  if (!parking) {
    return res.status(404).json({ data: null, error: 'Parking introuvable.' })
  }

  return res.json({ data: parking, error: null })
})

router.post('/', requireAdmin, async (req, res) => {
  const { name, address, totalSpots } = req.body
  if (!name || !address || !totalSpots || totalSpots < 1) {
    return res.status(400).json({ data: null, error: 'Nom, adresse et nombre de places requis.' })
  }

  const parking = await prisma.parking.create({
    data: {
      name,
      address,
      totalSpots: parseInt(totalSpots),
      spots: {
        create: Array.from({ length: parseInt(totalSpots) }, (_, i) => ({ number: String(i + 1) })),
      },
    },
    include: { spots: true },
  })

  return res.status(201).json({ data: parking, error: null })
})

router.put('/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)
  const { name, address } = req.body

  const existing = await prisma.parking.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ data: null, error: 'Parking introuvable.' })
  }

  const parking = await prisma.parking.update({
    where: { id },
    data: { name, address },
  })

  return res.json({ data: parking, error: null })
})

router.delete('/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id)

  const existing = await prisma.parking.findUnique({ where: { id } })
  if (!existing) {
    return res.status(404).json({ data: null, error: 'Parking introuvable.' })
  }

  await prisma.parking.delete({ where: { id } })
  return res.json({ data: { id }, error: null })
})

export default router
