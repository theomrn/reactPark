import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getReservationById } from '../../api/reservations'
import QRDisplay from '../../components/QRDisplay'
import { RESERVATION_STATUS_LABELS } from '../../constants/reservation'
import styles from './ReservationDetail.module.css'

export default function ReservationDetail() {
  const { id } = useParams()
  const [reservation, setReservation] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    getReservationById(id).then(({ data, error: err }) => {
      if (err) setError(err)
      else setReservation(data)
    }).catch(() => setError('Impossible de charger la réservation.'))
  }, [id])

  if (error) return (
    <div className={styles.container}>
      <p className={styles.error}>{error}</p>
      <Link to="/user/reservations" className={styles.back}>← Retour</Link>
    </div>
  )

  if (!reservation) return <p className={styles.loading}>Chargement...</p>

  return (
    <div className={styles.container}>
      <Link to="/user/reservations" className={styles.back}>← Mes réservations</Link>
      <div className={styles.card}>
        <h1>Réservation #{reservation.id}</h1>
        <div className={styles.details}>
          <div className={styles.row}>
            <span>Parking</span>
            <strong>{reservation.spot?.parking?.name}</strong>
          </div>
          <div className={styles.row}>
            <span>Place</span>
            <strong>{reservation.spot?.number}</strong>
          </div>
          <div className={styles.row}>
            <span>Début</span>
            <strong>{new Date(reservation.startDate).toLocaleString('fr-FR')}</strong>
          </div>
          <div className={styles.row}>
            <span>Fin</span>
            <strong>{new Date(reservation.endDate).toLocaleString('fr-FR')}</strong>
          </div>
          <div className={styles.row}>
            <span>Statut</span>
            <strong className={styles[reservation.status.toLowerCase()]}>
              {RESERVATION_STATUS_LABELS[reservation.status]}
            </strong>
          </div>
        </div>
        <div className={styles.qr}>
          <h2>QR Code d'accès</h2>
          <QRDisplay value={`${window.location.origin}/guide/${reservation.qrToken}`} />
          <p className={styles.qrHint}>Présentez ce code à l'entrée du parking.</p>
          <Link to={`/guide/${reservation.qrToken}`} className={styles.guideBtn}>
            Voir le guidage
          </Link>
        </div>
      </div>
    </div>
  )
}
