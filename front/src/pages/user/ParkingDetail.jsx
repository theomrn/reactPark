import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getParkingById } from '../../api/parkings'
import { createReservation } from '../../api/reservations'
import DateTimePicker from '../../components/DateTimePicker/DateTimePicker'
import styles from './ParkingDetail.module.css'

const PRESETS = [
  { label: '1h', minutes: 60 },
  { label: '2h', minutes: 120 },
  { label: '4h', minutes: 240 },
  { label: 'Journée', minutes: 480 },
]

function toLocalDatetimeValue(date) {
  const d = new Date(date)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function formatDuration(ms) {
  if (ms <= 0) return null
  const totalMin = Math.round(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m} min`
  if (m === 0) return `${h}h`
  return `${h}h ${m}min`
}

export default function ParkingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [parking, setParking] = useState(null)
  const [error, setError] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [dateError, setDateError] = useState(null)

  useEffect(() => {
    const now = new Date()
    now.setSeconds(0, 0)
    const start = toLocalDatetimeValue(now)
    const end = toLocalDatetimeValue(new Date(now.getTime() + 60 * 60 * 1000))
    setStartDate(start)
    setEndDate(end)
  }, [])

  useEffect(() => {
    getParkingById(id).then(({ data, error: err }) => {
      if (err) setError(err)
      else setParking(data)
    }).catch(() => setError('Impossible de charger ce parking.'))
  }, [id])

  function applyPreset(minutes) {
    const base = startDate ? new Date(startDate) : new Date()
    base.setSeconds(0, 0)
    const start = toLocalDatetimeValue(base)
    const end = toLocalDatetimeValue(new Date(base.getTime() + minutes * 60000))
    setStartDate(start)
    setEndDate(end)
    setDateError(null)
  }

  function handleStartChange(val) {
    setStartDate(val)
    if (endDate && new Date(val) >= new Date(endDate)) {
      const newEnd = toLocalDatetimeValue(new Date(new Date(val).getTime() + 60 * 60 * 1000))
      setEndDate(newEnd)
    }
    setDateError(null)
  }

  function handleEndChange(val) {
    setEndDate(val)
    if (startDate && new Date(val) <= new Date(startDate)) {
      setDateError('La fin doit être après le début.')
    } else {
      setDateError(null)
    }
  }

  const duration = startDate && endDate
    ? formatDuration(new Date(endDate) - new Date(startDate))
    : null

  const durationMs = startDate && endDate
    ? new Date(endDate) - new Date(startDate)
    : 0

  async function handleReserve(e) {
    e.preventDefault()
    if (!selectedSpot) { setError('Veuillez sélectionner une place.'); return }
    if (durationMs <= 0) { setDateError('Période invalide.'); return }
    setSubmitting(true)
    setError(null)
    try {
      const { data, error: err } = await createReservation({
        spotId: selectedSpot,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      })
      if (err) { setError(err); return }
      navigate(`/user/reservations/${data.id}`)
    } catch {
      setError('Erreur lors de la réservation.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!parking && !error) return <p className={styles.loading}>Chargement...</p>

  return (
    <div className={styles.container}>
      <Link to="/user/parkings" className={styles.back}>← Parkings</Link>

      {parking && (
        <div className={styles.header}>
          <h1>{parking.name}</h1>
          <p className={styles.address}>{parking.address}</p>
          <div className={styles.meta}>
            <span className={styles.badge}>
              {parking.spots?.filter(s => s.isAvailable !== false).length ?? parking.spots?.length ?? 0} places disponibles
            </span>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}

      {parking && (
        <form onSubmit={handleReserve} className={styles.form}>

          {/* SECTION DATES */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>1</span>
              <h2>Choisir la période</h2>
            </div>

            <div className={styles.presets}>
              {PRESETS.map(p => (
                <button
                  key={p.label}
                  type="button"
                  className={styles.preset}
                  onClick={() => applyPreset(p.minutes)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className={styles.dates}>
              <DateTimePicker
                id="start"
                label="Arrivée"
                value={startDate}
                onChange={handleStartChange}
                min={toLocalDatetimeValue(new Date())}
              />
              <div className={styles.dateArrow}>→</div>
              <DateTimePicker
                id="end"
                label="Départ"
                value={endDate}
                onChange={handleEndChange}
                min={startDate || toLocalDatetimeValue(new Date())}
                alignRight
              />
            </div>

            {dateError && <p className={styles.fieldError}>{dateError}</p>}

            {duration && !dateError && (
              <div className={styles.durationBadge}>
                Durée : <strong>{duration}</strong>
              </div>
            )}
          </div>

          {/* SECTION PLACES */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionNum}>2</span>
              <h2>Sélectionner une place</h2>
            </div>
            <div className={styles.spots}>
              {parking.spots.map(spot => (
                <button
                  key={spot.id}
                  type="button"
                  className={`${styles.spot} ${selectedSpot === spot.id ? styles.selected : ''}`}
                  onClick={() => setSelectedSpot(spot.id)}
                  disabled={spot.isAvailable === false}
                  title={spot.isAvailable === false ? `Place ${spot.number} — occupée` : `Place ${spot.number}`}
                >
                  {spot.number}
                </button>
              ))}
            </div>
            {selectedSpot && (
              <p className={styles.spotHint}>
                Place <strong>{parking.spots.find(s => s.id === selectedSpot)?.number}</strong> sélectionnée
              </p>
            )}
          </div>

          {/* RECAP + SUBMIT */}
          <div className={styles.submit}>
            <button
              type="submit"
              disabled={submitting || !!dateError || !selectedSpot}
              className={styles.btn}
            >
              {submitting ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
