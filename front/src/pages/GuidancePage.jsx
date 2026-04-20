import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGuide } from '../api/guide'
import styles from './GuidancePage.module.css'

const CELL = 60
const GAP  = 8
const PAD  = 28
const AISLE = 22

function cellCenter(col, row) {
  return {
    x: PAD + col * (CELL + GAP) + CELL / 2,
    y: PAD + row * (CELL + GAP) + CELL / 2,
  }
}

function buildGuidancePath(entrance, target, entranceCol, entranceRow, targetCol, targetRow) {
  const crossRow = Math.min(entranceRow, targetRow)
  const aisleY   = PAD + crossRow * (CELL + GAP) + CELL + AISLE / 2

  const entranceGapX = targetCol >= entranceCol
    ? PAD + entranceCol * (CELL + GAP) + CELL + GAP / 2
    : PAD + entranceCol * (CELL + GAP) - GAP / 2

  const targetGapX = targetCol >= entranceCol
    ? PAD + targetCol * (CELL + GAP) - GAP / 2
    : PAD + targetCol * (CELL + GAP) + CELL + GAP / 2

  return [
    entrance,
    { x: entranceGapX, y: entrance.y },
    { x: entranceGapX, y: aisleY },
    { x: targetGapX,   y: aisleY },
    { x: targetGapX,   y: target.y },
    target,
  ]
}

function pointsToPathD(points) {
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
}

function estimateDistance(entranceCol, entranceRow, targetCol, targetRow) {
  const steps = Math.abs(targetCol - entranceCol) + Math.abs(targetRow - entranceRow)
  return Math.max(1, Math.round(steps * 0.5))
}

export default function GuidancePage() {
  const { token } = useParams()
  const [guide,    setGuide]    = useState(null)
  const [error,    setError]    = useState(null)
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    getGuide(token)
      .then(({ data, error: err }) => {
        if (err) setError(err)
        else {
          setGuide(data)
          setTimeout(() => setAnimated(true), 400)
        }
      })
      .catch(() => setError('QR Code invalide ou expiré.'))
  }, [token])

  /* ── Loading ── */
  if (!guide && !error) return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.loadingWrap}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Récupération de votre itinéraire…</p>
      </div>
    </div>
  )

  /* ── Error ── */
  if (error) return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />
      <div className={styles.errorCard}>
        <div className={styles.errorIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="26" height="26">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className={styles.errorTitle}>QR Code invalide</h2>
        <p className={styles.errorMsg}>{error}</p>
      </div>
    </div>
  )

  /* ── Data ── */
  const { parking, targetSpot } = guide
  const spots = parking.spots

  const maxCol = Math.max(...spots.map(s => s.col), parking.entranceCol, parking.cols - 1)
  const maxRow = Math.max(...spots.map(s => s.row), parking.entranceRow)

  const svgW = PAD * 2 + (maxCol + 1) * (CELL + GAP) - GAP
  const svgH = PAD * 2 + (maxRow + 1) * (CELL + GAP) - GAP + AISLE

  const entrance = cellCenter(parking.entranceCol, parking.entranceRow)
  const target   = cellCenter(targetSpot.col, targetSpot.row)

  const guidancePath = buildGuidancePath(
    entrance, target,
    parking.entranceCol, parking.entranceRow,
    targetSpot.col, targetSpot.row,
  )
  const pathD = pointsToPathD(guidancePath)
  const eta   = estimateDistance(parking.entranceCol, parking.entranceRow, targetSpot.col, targetSpot.row)

  return (
    <div className={styles.page}>
      <div className={styles.orb1} aria-hidden="true" />
      <div className={styles.orb2} aria-hidden="true" />

      {/* ── Header ── */}
      <header className={styles.header}>
        <p className={styles.parkingName}>{parking.name}</p>
        <div className={styles.placeRow}>
          <span className={styles.placeLabel}>Votre place</span>
          <span className={styles.placeNumber}>{targetSpot.number}</span>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            ~{eta} min à pied
          </span>
          <span className={`${styles.badge} ${styles.badgeLive}`}>
            <span className={styles.liveDot} />
            Guidage actif
          </span>
        </div>
      </header>

      {/* ── Map card ── */}
      <div className={styles.mapCard}>
        <div className={styles.mapCardHeader}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
          </svg>
          Plan du parking
        </div>

        <div className={styles.mapScroll}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} className={styles.svg} role="img" aria-label={`Plan de guidage vers la place ${targetSpot.number}`}>
            <defs>
              <radialGradient id="bgGrad" cx="40%" cy="40%" r="80%">
                <stop offset="0%" stopColor="#F5F3EE" />
                <stop offset="100%" stopColor="#E8E4D8" />
              </radialGradient>
              <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#0EA26A" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0EA26A" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FF9E42" />
                <stop offset="50%" stopColor="#00A0F3" />
                <stop offset="100%" stopColor="#0A0A2E" />
              </linearGradient>
              <filter id="spotShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0A0A2E" floodOpacity="0.08" />
              </filter>
              <filter id="targetShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#0EA26A" floodOpacity="0.35" />
              </filter>
              <filter id="entranceShadow" x="-40%" y="-40%" width="180%" height="180%">
                <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="#FF9E42" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Background */}
            <rect x={0} y={0} width={svgW} height={svgH} rx={16} fill="url(#bgGrad)" />

            {/* Aisle lane guides */}
            {Array.from({ length: maxRow + 1 }, (_, row) => {
              const laneY = PAD + row * (CELL + GAP) + CELL
              return (
                <rect
                  key={`lane-${row}`}
                  x={PAD - 4} y={laneY}
                  width={svgW - (PAD - 4) * 2}
                  height={AISLE}
                  rx={4}
                  fill="#E0DDD4"
                  opacity={0.5}
                />
              )
            })}

            {/* Neutral spots */}
            {spots.filter(s => s.id !== targetSpot.id).map(spot => {
              const c = cellCenter(spot.col, spot.row)
              return (
                <g key={spot.id} filter="url(#spotShadow)">
                  <rect
                    x={c.x - CELL / 2} y={c.y - CELL / 2}
                    width={CELL} height={CELL} rx={10}
                    fill="#FFFFFF"
                    stroke="#D8D4C8" strokeWidth={1.5}
                  />
                  <text
                    x={c.x} y={c.y + 5}
                    textAnchor="middle"
                    fontSize={13}
                    fill="#5A6080"
                    fontFamily="'Manrope', system-ui, sans-serif"
                    fontWeight="600"
                  >
                    {spot.number}
                  </text>
                </g>
              )
            })}

            {/* Path shadow / glow */}
            <path
              d={pathD}
              fill="none"
              stroke="#00A0F3"
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.08}
            />

            {/* Guidance path */}
            <path
              d={pathD}
              fill="none"
              stroke="url(#pathGrad)"
              strokeWidth={4.5}
              strokeDasharray="14 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={animated ? styles.pathAnimated : styles.pathHidden}
            />

            {/* Moving dot along path */}
            {animated && (
              <g>
                <circle r={10} fill="#00A0F3" opacity={0.2}>
                  <animateMotion dur="2.2s" begin="0.5s" repeatCount="1" fill="freeze" path={pathD} />
                </circle>
                <circle r={6} fill="#00A0F3" stroke="#fff" strokeWidth={2.5}>
                  <animateMotion dur="2.2s" begin="0.5s" repeatCount="1" fill="freeze" path={pathD} />
                </circle>
              </g>
            )}

            {/* Target glow halo */}
            <circle cx={target.x} cy={target.y} r={CELL} fill="url(#targetGlow)" />

            {/* Target pulse rings */}
            <circle cx={target.x} cy={target.y} r={CELL / 2 + 4} fill="none" stroke="#0EA26A" strokeWidth={2} opacity={0}>
              <animate attributeName="r"       from={CELL / 2 + 4} to={CELL / 2 + 22} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from={0.5}          to={0}             dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx={target.x} cy={target.y} r={CELL / 2 + 4} fill="none" stroke="#0EA26A" strokeWidth={1.5} opacity={0}>
              <animate attributeName="r"       from={CELL / 2 + 4} to={CELL / 2 + 22} dur="2s" begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" from={0.35}         to={0}             dur="2s" begin="0.7s" repeatCount="indefinite" />
            </circle>

            {/* Target spot */}
            <g filter="url(#targetShadow)">
              <rect
                x={target.x - CELL / 2} y={target.y - CELL / 2}
                width={CELL} height={CELL} rx={12}
                fill="#0EA26A"
                stroke="#0A7A52" strokeWidth={2}
              />
              <text x={target.x} y={target.y - 7}
                textAnchor="middle" fontSize={9} fill="rgba(255,255,255,0.75)"
                fontFamily="'Manrope', system-ui, sans-serif" fontWeight="700"
                letterSpacing="1">PLACE
              </text>
              <text x={target.x} y={target.y + 12}
                textAnchor="middle" fontSize={18} fontWeight="700" fill="#fff"
                fontFamily="'Space Grotesk', system-ui, sans-serif"
              >
                {targetSpot.number}
              </text>
            </g>

            {/* Entrance */}
            <g filter="url(#entranceShadow)">
              <rect
                x={entrance.x - CELL / 2} y={entrance.y - CELL / 2}
                width={CELL} height={CELL} rx={12}
                fill="#FF9E42"
                stroke="#E8872A" strokeWidth={2}
              />
              <text x={entrance.x} y={entrance.y - 6}
                textAnchor="middle" fontSize={8} fill="rgba(255,255,255,0.85)"
                fontFamily="'Manrope', system-ui, sans-serif" fontWeight="700"
                letterSpacing="0.8">ENTRÉE
              </text>
              {/* Arrow icon */}
              <text x={entrance.x} y={entrance.y + 14}
                textAnchor="middle" fontSize={18} fill="#fff">
                ↓
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className={styles.legend} aria-label="Légende de la carte">
        <div className={styles.legendItem}>
          <span className={styles.dotGreen} aria-hidden="true" />
          Votre place
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dotOrange} aria-hidden="true" />
          Entrée
        </div>
        <div className={styles.legendItem}>
          <span className={styles.lineBlue} aria-hidden="true" />
          Itinéraire
        </div>
      </div>

      {/* ── Info card ── */}
      <div className={styles.infoCard}>
        <div className={styles.infoRow}>
          <div className={styles.infoIconWrap}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div>
            <p className={styles.infoLabel}>Parking</p>
            <p className={styles.infoValue}>{parking.name}</p>
          </div>
        </div>
        <div className={styles.infoDivider} />
        <div className={styles.infoRow}>
          <div className={styles.infoIconWrap}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          </div>
          <div>
            <p className={styles.infoLabel}>Numéro de place</p>
            <p className={styles.infoValue}>{targetSpot.number}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
