import { Link } from 'react-router-dom'
import styles from './Home.module.css'

export default function Home() {
  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <span className={styles.eyebrow}>
          <span className={styles.dot} aria-hidden="true" />
          Disponibilité en temps réel
        </span>

        <h1 className={styles.title}>
          Le parking urbain,<br />
          <em>repensé</em> pour vos trajets.
        </h1>

        <p className={styles.subtitle}>
          Réservez une place, suivez la disponibilité en direct et laissez-vous guider
          jusqu’à votre emplacement — sans tourner en rond, sans mauvaise surprise.
        </p>

        <div className={styles.ctaRow}>
          <Link to="/login" className={styles.cta}>
            Commencer
            <svg className={styles.arrow} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
          <Link to="/register" className={styles.ctaGhost}>Créer un compte</Link>
        </div>

        <div className={styles.meta}>
          <div className={styles.stat}>
            <strong>24/7</strong>
            <span>Accès continu</span>
          </div>
          <div className={styles.stat}>
            <strong>98%</strong>
            <span>Taux de précision</span>
          </div>
          <div className={styles.stat}>
            <strong>&lt; 30s</strong>
            <span>Pour réserver</span>
          </div>
        </div>
      </div>

      <div className={styles.visual} aria-hidden="true">
        <span className={styles.badge}>Temps réel</span>

        <div className={`${styles.glassCard} ${styles.cardMain}`}>
          <div className={styles.cardLabel}>
            <span>Parking Central</span>
            <span className={styles.live}>Live</span>
          </div>
          <div className={styles.parkingName}>République — Niveau 2</div>
          <div className={styles.parkingAddr}>12 place de la République</div>

          <div className={styles.spotGrid}>
            {[1,1,0,1,1,0, 0,1,1,1,0,1, 1,0,1,1,1,1, 1,1,0,1,1,0].map((s, i) => (
              <div key={i} className={`${styles.spot} ${s ? styles.free : styles.taken}`} />
            ))}
          </div>

          <div className={styles.cardFooter}>
            <strong>17 <em>/ 24</em></strong>
            <span>places libres</span>
          </div>
        </div>

        <div className={`${styles.glassCard} ${styles.cardSmall}`}>
          <div className={styles.qr} />
          <div className={styles.label}>Votre emplacement</div>
          <div className={styles.slot}>B-14</div>
        </div>
      </div>
    </section>
  )
}
