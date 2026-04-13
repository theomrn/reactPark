import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getParkingById, updateParkingMap } from '../../api/parkings'
import styles from './ParkingMap.module.css'

export default function ParkingMap() {
  const { id } = useParams()
  const [parking, setParking] = useState(null)
  const [cols, setCols] = useState(5)
  const [rows, setRows] = useState(5)
  const [entrancePos, setEntrancePos] = useState({ col: 0, row: 0 })
  const [spotPositions, setSpotPositions] = useState({})
  const [selected, setSelected] = useState(null) // 'entrance' | spotId (number)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getParkingById(id).then(({ data, error: err }) => {
      if (err) { setError(err); return }
      setParking(data)
      setCols(data.cols)
      const positions = {}
      data.spots.forEach(s => { positions[s.id] = { col: s.col, row: s.row } })
      setSpotPositions(positions)
      setEntrancePos({ col: data.entranceCol, row: data.entranceRow })
      const maxRow = Math.max(0, ...data.spots.map(s => s.row), data.entranceRow)
      setRows(maxRow + 2)
    }).catch(() => setError('Impossible de charger le parking.'))
  }, [id])

  if (error) return <p className={styles.error}>{error}</p>
  if (!parking) return <p className={styles.loading}>Chargement...</p>

  const spots = parking.spots

  // Build lookup: 'col,row' → { type, spot? }
  const cellMap = {}
  Object.entries(spotPositions).forEach(([spotId, pos]) => {
    const spot = spots.find(s => s.id === parseInt(spotId))
    if (spot) cellMap[`${pos.col},${pos.row}`] = { type: 'spot', spot }
  })
  // Entrance drawn on top — overrides any spot at same cell visually
  cellMap[`${entrancePos.col},${entrancePos.row}`] = { type: 'entrance' }

  function handleCellClick(col, row) {
    if (selected === null) {
      const cell = cellMap[`${col},${row}`]
      if (cell?.type === 'entrance') setSelected('entrance')
      else if (cell?.type === 'spot') setSelected(cell.spot.id)
    } else {
      if (selected === 'entrance') {
        setEntrancePos({ col, row })
      } else {
        setSpotPositions(prev => ({ ...prev, [selected]: { col, row } }))
      }
      setSelected(null)
      setSaved(false)
    }
  }

  function handlePanelSelect(item) {
    setSelected(prev => (prev === item ? null : item))
  }

  function handleAutoFill() {
    const newPositions = {}
    spots.forEach((spot, i) => {
      newPositions[spot.id] = { col: i % cols, row: Math.floor(i / cols) }
    })
    setSpotPositions(newPositions)
    setRows(Math.max(Math.ceil(spots.length / cols) + 1, rows))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const { error: err } = await updateParkingMap(id, {
      cols,
      entranceCol: entrancePos.col,
      entranceRow: entrancePos.row,
      spots: Object.entries(spotPositions).map(([spotId, pos]) => ({
        id: parseInt(spotId),
        col: pos.col,
        row: pos.row,
      })),
    })
    setSaving(false)
    if (err) setError(err)
    else setSaved(true)
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <Link to="/admin/parkings" className={styles.back}>← Retour</Link>
        <h1 className={styles.title}>Carte : {parking.name}</h1>
        <div className={styles.topActions}>
          <label className={styles.colsLabel}>
            Colonnes
            <input
              type="number"
              min={1}
              max={20}
              value={cols}
              onChange={e => { setCols(Math.max(1, parseInt(e.target.value) || 1)); setSaved(false) }}
              className={styles.colsInput}
            />
          </label>
          <label className={styles.colsLabel}>
            Lignes
            <input
              type="number"
              min={1}
              max={30}
              value={rows}
              onChange={e => { setRows(Math.max(1, parseInt(e.target.value) || 1)); setSaved(false) }}
              className={styles.colsInput}
            />
          </label>
          <button onClick={handleAutoFill} className={styles.btnAuto}>Remplir auto</button>
          <button onClick={handleSave} disabled={saving} className={styles.btnSave}>
            {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </button>
          {saved && <span className={styles.savedMsg}>Sauvegarde OK</span>}
        </div>
      </div>

      {selected !== null && (
        <p className={styles.hint}>
          {selected === 'entrance' ? 'Entrée sélectionnée' : `Place ${spots.find(s => s.id === selected)?.number} sélectionnée`}
          {' '}— cliquez une cellule pour la placer.
          <button className={styles.cancelBtn} onClick={() => setSelected(null)}>Annuler</button>
        </p>
      )}

      <div className={styles.layout}>
        {/* Panel */}
        <div className={styles.panel}>
          <p className={styles.panelTitle}>Éléments</p>

          <div
            className={`${styles.panelItem} ${styles.itemEntrance} ${selected === 'entrance' ? styles.panelSelected : ''}`}
            onClick={() => handlePanelSelect('entrance')}
          >
            Entrée
          </div>

          <p className={styles.panelSubtitle}>Places</p>
          <div className={styles.spotList}>
            {spots.map(spot => (
              <div
                key={spot.id}
                className={`${styles.panelItem} ${styles.itemSpot} ${selected === spot.id ? styles.panelSelected : ''}`}
                onClick={() => handlePanelSelect(spot.id)}
              >
                {spot.number}
              </div>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className={styles.gridWrapper}>
          <div
            className={styles.grid}
            style={{ gridTemplateColumns: `repeat(${cols}, 56px)` }}
          >
            {Array.from({ length: rows * cols }, (_, i) => {
              const row = Math.floor(i / cols)
              const col = i % cols
              const key = `${col},${row}`
              const cell = cellMap[key]
              const isEntrance = cell?.type === 'entrance'
              const isSpot = cell?.type === 'spot'
              const isSelectedSpot = isSpot && selected === cell.spot.id
              const isSelectedEntrance = isEntrance && selected === 'entrance'
              const isSelectable = selected !== null && !isSelectedSpot && !isSelectedEntrance

              return (
                <div
                  key={key}
                  className={[
                    styles.cell,
                    isEntrance ? styles.cellEntrance : '',
                    isSpot ? styles.cellSpot : '',
                    isSelectedSpot || isSelectedEntrance ? styles.cellActive : '',
                    isSelectable ? styles.cellDrop : '',
                  ].join(' ')}
                  onClick={() => handleCellClick(col, row)}
                >
                  {isEntrance && <span className={styles.cellLabel}>E</span>}
                  {isSpot && <span className={styles.cellLabel}>{cell.spot.number}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
