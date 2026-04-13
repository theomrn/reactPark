import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import parkingRoutes from './routes/parkings.js'
import reservationRoutes from './routes/reservations.js'
import statsRoutes from './routes/stats.js'

const app = express()
const PORT = process.env.PORT || 3002

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/parkings', parkingRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/stats', statsRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ data: null, error: 'Erreur interne du serveur.' })
})

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`)
})
