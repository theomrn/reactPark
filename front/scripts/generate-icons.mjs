import { createCanvas } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

function generateIcon(size, outputPath) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')

  const radius = size * 0.2
  ctx.beginPath()
  ctx.moveTo(radius, 0)
  ctx.lineTo(size - radius, 0)
  ctx.quadraticCurveTo(size, 0, size, radius)
  ctx.lineTo(size, size - radius)
  ctx.quadraticCurveTo(size, size, size - radius, size)
  ctx.lineTo(radius, size)
  ctx.quadraticCurveTo(0, size, 0, size - radius)
  ctx.lineTo(0, radius)
  ctx.quadraticCurveTo(0, 0, radius, 0)
  ctx.closePath()
  ctx.fillStyle = '#2E7D32'
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.font = `bold ${size * 0.6}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('P', size / 2, size / 2 + size * 0.04)

  writeFileSync(outputPath, canvas.toBuffer('image/png'))
  console.log(`Generated: ${outputPath}`)
}

mkdirSync(publicDir, { recursive: true })
generateIcon(64,  join(publicDir, 'pwa-64.png'))
generateIcon(192, join(publicDir, 'pwa-192.png'))
generateIcon(512, join(publicDir, 'pwa-512.png'))
generateIcon(512, join(publicDir, 'maskable-icon-512.png'))
generateIcon(180, join(publicDir, 'apple-touch-icon-180.png'))
console.log('Done.')
