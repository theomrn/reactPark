import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getParkingById } from '../../api/parkings'
import { createReservation } from '../../api/reservations'
import styles from './ParkingDetail.module.css'

export default function ParkingDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [parking, setParking] = useState(null)
  const [error, setError] = useState(null)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    getParkingById(id).then(({ data, error: err }) => {
      if (err) setError(err)
      else setParking(data)
    }).catch(() => setError('Impossible de charger ce parking.'))
  }, [id])

  async function handleReserve(e) {
    e.preventDefault()
    if (!selectedSpot) { setError('Veuillez sélectionner une place.'); return }
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
      {parking && (
        <>
          <h1>{parking.name}</h1>
          <p className={styles.address}>{parking.address}</p>
        </>
      )}
      {error && <p className={styles.error}>{error}</p>}
      {parking && (
        <form onSubmit={handleReserve} className={styles.form}>
          <h2>Sélectionner une place</h2>
          <div className={styles.spots}>
            {parking.spots.map(spot => (
              <button
                key={spot.id}
                type="button"
                className={`${styles.spot} ${selectedSpot === spot.id ? styles.selected : ''}`}
                onClick={() => setSelectedSpot(spot.id)}
              >
                {spot.number}
              </button>
            ))}
          </div>
          <div className={styles.dates}>
            <label>
              Début
              <input
                type="datetime-local"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </label>
            <label>
              Fin
              <input
                type="datetime-local"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" disabled={submitting} className={styles.btn}>
            {submitting ? 'Réservation en cours...' : 'Réserver'}
          </button>
        </form>
      )}
    </div>
  )
}
