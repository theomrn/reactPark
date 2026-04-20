import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyReservations, cancelReservation } from '../../api/reservations'
import { RESERVATION_STATUSES, RESERVATION_TAB_LABELS } from '../../constants/reservation'
import styles from './ReservationList.module.css'

function CancelModal({ reservation, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className={styles.modal}>
        <h2 id="modal-title">Annuler la réservation ?</h2>
        <p className={styles.modalSub}>Cette action est irréversible.</p>
        <div className={styles.modalDetails}>
          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>Parking</span>
            <span>{reservation.spot?.parking?.name ?? 'Parking'}</span>
          </div>
          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>Place</span>
            <span>{reservation.spot?.number}</span>
          </div>
          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>Début</span>
            <span>{new Date(reservation.startDate).toLocaleString('fr-FR')}</span>
          </div>
          <div className={styles.modalRow}>
            <span className={styles.modalLabel}>Fin</span>
            <span>{new Date(reservation.endDate).toLocaleString('fr-FR')}</span>
          </div>
        </div>
        <div className={styles.modalActions}>
          <button onClick={onCancel} className={styles.btnSecondary}>Retour</button>
          <button onClick={onConfirm} className={styles.btnDanger}>
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Confirmer l'annulation
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ReservationList() {
  const [reservations, setReservations] = useState([])
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('ACTIVE')
  const [pendingCancel, setPendingCancel] = useState(null)

  function load() {
    getMyReservations().then(({ data, error: err }) => {
      if (err) setError(err)
      else setReservations(data)
    }).catch(() => setError('Impossible de charger les réservations.'))
  }

  useEffect(load, [])

  async function handleConfirmCancel() {
    const { error: err } = await cancelReservation(pendingCancel.id)
    if (err) { setError(err); setPendingCancel(null); return }
    setReservations(prev => prev.map(r => r.id === pendingCancel.id ? { ...r, status: 'CANCELLED' } : r))
    setPendingCancel(null)
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
              <Link to={`/user/reservations/${r.id}`} className={styles.btn} aria-label="Voir la réservation">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </Link>
              {r.status === 'ACTIVE' && (
                <button
                  onClick={() => setPendingCancel(r)}
                  className={styles.btnDanger}
                  aria-label="Annuler la réservation"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6M14 11v6"/>
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {pendingCancel && (
        <CancelModal
          reservation={pendingCancel}
          onConfirm={handleConfirmCancel}
          onCancel={() => setPendingCancel(null)}
        />
      )}
    </div>
  )
}
