import { Router } from 'express'
import prisma from '../lib/prisma.js'
import { wrap } from '../lib/asyncHandler.js'

const router = Router()

router.get('/:token', wrap(async (req, res) => {
  const { token } = req.params

  const reservation = await prisma.reservation.findUnique({
    where: { qrToken: token },
    include: {
      spot: {
        include: {
          parking: {
            include: {
              spots: { select: { id: true, number: true, row: true, col: true } },
            },
          },
        },
      },
    },
  })

  if (!reservation) {
    return res.status(404).json({ data: null, error: 'QR Code invalide.' })
  }

  const { spot } = reservation

  return res.json({
    data: {
      parking: {
        id: spot.parking.id,
        name: spot.parking.name,
        cols: spot.parking.cols,
        entranceCol: spot.parking.entranceCol,
        entranceRow: spot.parking.entranceRow,
        spots: spot.parking.spots,
      },
      targetSpot: { id: spot.id, number: spot.number, row: spot.row, col: spot.col },
    },
    error: null,
  })
}))

export default router
