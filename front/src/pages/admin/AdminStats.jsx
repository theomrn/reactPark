import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, ResponsiveContainer, Legend,
} from 'recharts'
import { getParkingStats, getReservationStats } from '../../api/stats'
import styles from './AdminStats.module.css'

export default function AdminStats() {
  const [parkingStats, setParkingStats] = useState([])
  const [reservationStats, setReservationStats] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    Promise.all([getParkingStats(), getReservationStats()]).then(([ps, rs]) => {
      if (ps.error) { setError(ps.error); return }
      if (rs.error) { setError(rs.error); return }
      setParkingStats(ps.data)
      setReservationStats(rs.data)
    }).catch(() => setError('Impossible de charger les statistiques.'))
  }, [])

  return (
    <div className={styles.container}>
      <h1>Statistiques</h1>
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h2>Taux d'occupation par parking</h2>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={parkingStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis unit="%" tick={{ fontSize: 12 }} domain={[0, 100]} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="occupancyRate" name="Taux d'occupation" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Réservations par jour — 30 derniers jours</h2>
        <div className={styles.chartBox}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reservationStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="count"
                name="Réservations"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
