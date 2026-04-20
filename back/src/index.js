import app from './app.js'

const PORT = process.env.PORT || 3002

app.listen(PORT, () => {
  console.log(`Backend démarré sur http://localhost:${PORT}`)
})
