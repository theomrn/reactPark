import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getGuide } from '../api/guide'
import styles from './GuidancePage.module.css'

const CELL = 56
const GAP = 6
const PAD = 20
const AISLE = 18  // height of the driving corridor below each row

function cellCenter(col, row) {
  return {
    x: PAD + col * (CELL + GAP) + CELL / 2,
    y: PAD + row * (CELL + GAP) + CELL / 2,
  }
}

/**
 * Returns a polyline path that routes through the gaps between cells,
 * never cutting through spot cells.
 *
 * The path exits each spot sideways into the column gap, travels down
 * the corridor, then enters the target sideways from the column gap.
 */
function buildGuidancePath(entrance, target, entranceCol, entranceRow, targetCol, targetRow) {
  const crossRow = Math.min(entranceRow, targetRow)
  const aisleY = PAD + crossRow * (CELL + GAP) + CELL + AISLE / 2

  // Column gap on the side of entrance facing toward target (right gap if same col)
  const entranceGapX = targetCol >= entranceCol
    ? PAD + entranceCol * (CELL + GAP) + CELL + GAP / 2
    : PAD + entranceCol * (CELL + GAP) - GAP / 2

  // Column gap on the side of target facing toward entrance (left gap if same col)
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

export default function GuidancePage() {
  const { token } = useParams()
  const [guide, setGuide] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getGuide(token)
      .then(({ data, error: err }) => {
        if (err) setError(err)
        else setGuide(data)
      })
      .catch(() => setError('QR Code invalide ou expiré.'))
  }, [token])

  if (error) return (
    <div className={styles.page}>
      <p className={styles.error}>{error}</p>
    </div>
  )

  if (!guide) return (
    <div className={styles.page}>
      <p className={styles.loading}>Chargement...</p>
    </div>
  )

  const { parking, targetSpot } = guide
  const spots = parking.spots

  const maxCol = Math.max(...spots.map(s => s.col), parking.entranceCol, parking.cols - 1)
  const maxRow = Math.max(...spots.map(s => s.row), parking.entranceRow)

  const svgW = PAD * 2 + (maxCol + 1) * (CELL + GAP) - GAP
  // Extra height to accommodate the aisle corridor below the last row
  const svgH = PAD * 2 + (maxRow + 1) * (CELL + GAP) - GAP + AISLE

  const entrance = cellCenter(parking.entranceCol, parking.entranceRow)
  const target = cellCenter(targetSpot.col, targetSpot.row)

  const guidancePath = buildGuidancePath(entrance, target, parking.entranceCol, parking.entranceRow, targetSpot.col, targetSpot.row)
  const pointsStr = guidancePath.map(p => `${p.x},${p.y}`).join(' ')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className={styles.parkingName}>{parking.name}</p>
        <h1 className={styles.place}>Place <strong>{targetSpot.number}</strong></h1>
      </div>

      <div className={styles.mapScroll}>
        <svg viewBox={`0 0 ${svgW} ${svgH}`} className={styles.svg}>
          <rect x={0} y={0} width={svgW} height={svgH} rx={10} fill="#f0f2f5" />

          {/* Neutral spots */}
          {spots.filter(s => s.id !== targetSpot.id).map(spot => {
            const c = cellCenter(spot.col, spot.row)
            return (
              <g key={spot.id}>
                <rect x={c.x - CELL / 2} y={c.y - CELL / 2} width={CELL} height={CELL} rx={6} fill="#d5d9e0" stroke="#bec3cc" strokeWidth={1} />
                <text x={c.x} y={c.y + 5} textAnchor="middle" fontSize={13} fill="#555" fontFamily="sans-serif">{spot.number}</text>
              </g>
            )
          })}

          {/* Guidance path — routed through the aisle, never through spot cells */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="#1565C0"
            strokeWidth={3.5}
            strokeDasharray="10 5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Target spot */}
          <g>
            <circle cx={target.x} cy={target.y} r={CELL / 2 + 5} fill="none" stroke="#1565C0" strokeWidth={2} opacity={0.35} />
            <rect x={target.x - CELL / 2} y={target.y - CELL / 2} width={CELL} height={CELL} rx={6} fill="#2E7D32" stroke="#1b5e20" strokeWidth={2} />
            <text x={target.x} y={target.y + 5} textAnchor="middle" fontSize={14} fontWeight="bold" fill="#fff" fontFamily="sans-serif">{targetSpot.number}</text>
          </g>

          {/* Entrance */}
          <g>
            <rect x={entrance.x - CELL / 2} y={entrance.y - CELL / 2} width={CELL} height={CELL} rx={6} fill="#E65100" stroke="#BF360C" strokeWidth={2} />
            <text x={entrance.x} y={entrance.y + 5} textAnchor="middle" fontSize={11} fontWeight="bold" fill="#fff" fontFamily="sans-serif">ENTREE</text>
          </g>
        </svg>
      </div>

      <div className={styles.legend}>
        <div className={styles.legendItem}><span className={styles.dotGreen} />Votre place</div>
        <div className={styles.legendItem}><span className={styles.dotOrange} />Entrée</div>
        <div className={styles.legendItem}><span className={styles.lineBlue} />Chemin</div>
      </div>
    </div>
  )
}
