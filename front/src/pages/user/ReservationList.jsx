import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReservations, cancelReservation } from '../../api/reservations'
import { RESERVATION_STATUSES, RESERVATION_TAB_LABELS } from '../../constants/reservation'
import styles from './ReservationList.module.css'

export default function ReservationList() {
  const [reservations, setReservations] = useState([])
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('ACTIVE')

  function load() {
    getMyReservations().then(({ data, error: err }) => {
      if (err) setError(err)
      else setReservations(data)
    }).catch(() => setError('Impossible de charger les réservations.'))
  }

  useEffect(load, [])

  async function handleCancel(id) {
    const { error: err } = await cancelReservation(id)
    if (err) { setError(err); return }
    setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'CANCELLED' } : r))
  }

  const filtered = reservations.filter(r => r.status === tab)

  return (
    <div className={styles.container}>
      <h1>Mes réservations</h1>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.tabs}>
        {RESERVATION_STATUSES.map(t => (
          <button
            key={t}
            className={`${styles.tab} ${tab === t ? styles.active : ''}`}
            onClick={() => setTab(t)}
          >
            {RESERVATION_TAB_LABELS[t]}
          </button>
        ))}
      </div>
      {filtered.length === 0 && <p className={styles.empty}>Aucune réservation.</p>}
      <ul className={styles.list}>
        {filtered.map(r => (
          <li key={r.id} className={styles.item}>
            <div className={styles.info}>
              <strong>{r.spot?.parking?.name ?? 'Parking'}</strong> — Place {r.spot?.number}
              <span className={styles.dates}>
                {new Date(r.startDate).toLocaleString('fr-FR')} → {new Date(r.endDate).toLocaleString('fr-FR')}
              </span>
            </div>
            <div className={styles.actions}>
              <Link to={`/user/reservations/${r.id}`} className={styles.btn}>Voir</Link>
              {r.status === 'ACTIVE' && (
                <button onClick={() => handleCancel(r.id)} className={styles.btnDanger}>
                  Annuler
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
