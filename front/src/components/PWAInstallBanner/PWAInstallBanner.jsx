import { usePWAInstall } from '../../hooks/usePWAInstall'
import styles from './PWAInstallBanner.module.css'

export default function PWAInstallBanner() {
  const { canInstall, showManual, install, dismiss } = usePWAInstall()

  if (!canInstall && !showManual) return null

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <span className={styles.icon}>
          <img src="/logo-bg.png" alt="" className={styles.iconImg} />
        </span>
        <div className={styles.text}>
          <strong>Téléchargez SmartPark</strong>
          {canInstall
            ? <span>Accédez à vos réservations et au guidage hors-ligne.</span>
            : <span>Menu <b>⋮</b> → <b>Ajouter à l'écran d'accueil</b></span>
          }
        </div>
      </div>
      <div className={styles.actions}>
        {canInstall && (
          <button className={styles.btnInstall} onClick={install}>Installer</button>
        )}
        <button className={styles.btnDismiss} onClick={dismiss}>Plus tard</button>
      </div>
    </div>
  )
}
