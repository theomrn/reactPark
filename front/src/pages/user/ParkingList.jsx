import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getParkings } from '../../api/parkings'
import styles from './ParkingList.module.css'

export default function ParkingList() {
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    getParkings().then(({ data, error: err }) => {
      if (err) setError(err)
      else setParkings(data)
    }).catch(() => setError('Impossible de charger les parkings.'))
  }, [])

  return (
    <div className={styles.container}>
      <h1>Parkings disponibles</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.grid}>
        {parkings.map(p => (
          <div key={p.id} className={styles.card}>
            <h2>{p.name}</h2>
            <p className={styles.address}>{p.address}</p>
            <p className={styles.spots}>
              <span className={p.availableSpots > 0 ? styles.available : styles.full}>
                {p.availableSpots} / {p.totalSpots}
              </span>{' '}
              places disponibles
            </p>
            <Link to={`/user/parkings/${p.id}`} className={styles.btn}>
              Réserver une place
            </Link>
          </div>
        ))}
        {parkings.length === 0 && !error && <p>Aucun parking disponible.</p>}
      </div>
    </div>
  )
}
