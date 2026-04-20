import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getParkings } from '../../api/parkings'
import styles from './ParkingList.module.css'

export default function ParkingList() {
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')

  useEffect(() => {
    getParkings().then(({ data, error: err }) => {
      if (err) setError(err)
      else setParkings(data)
    }).catch(() => setError('Impossible de charger les parkings.'))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return parkings
    return parkings.filter(p =>
      p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    )
  }, [parkings, query])

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>Parkings à proximité</span>
          <h1>Trouvez une place. Roulez tranquille.</h1>
          <p className={styles.lede}>
            Disponibilité mise à jour en direct. Réservez en quelques secondes,
            payez à la sortie.
          </p>
        </div>

        <label className={styles.search}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher un parking ou une adresse…"
            aria-label="Rechercher un parking"
          />
        </label>
      </header>

      {error && <p className={styles.error}>{error}</p>}

      <div className={`${styles.grid} stagger`}>
        {filtered.map(p => {
          const pct = p.totalSpots > 0 ? p.availableSpots / p.totalSpots : 0
          const isFull = p.availableSpots === 0
          return (
            <article key={p.id} className={styles.card}>
              <div className={styles.cardHead}>
                <h2>{p.name}</h2>
                <span className={`${styles.badge} ${isFull ? styles.full : styles.available}`}>
                  {isFull ? 'Complet' : 'Disponible'}
                </span>
              </div>
              <p className={styles.address}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 22s8-7.58 8-13a8 8 0 0 0-16 0c0 5.42 8 13 8 13Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>
                {p.address}
              </p>

              <div className={styles.availability}>
                <div className={`${styles.meter} ${isFull ? styles.full : ''}`}>
                  <span style={{ '--pct': Math.max(0.04, pct) }} />
                </div>
                <div className={styles.meterLabel}>
                  <span className={styles.spotsCount}>
                    <strong>{p.availableSpots}</strong>
                    <em>/ {p.totalSpots} places</em>
                  </span>
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                    {Math.round(pct * 100)}%
                  </span>
                </div>
              </div>

              <Link to={`/user/parkings/${p.id}`} className={styles.btn}>
                Réserver une place
                <svg className={styles.arrow} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            </article>
          )
        })}

        {filtered.length === 0 && !error && (
          <p className={styles.empty}>
            {query ? 'Aucun parking ne correspond à votre recherche.' : 'Aucun parking disponible.'}
          </p>
        )}
      </div>
    </div>
  )
}
