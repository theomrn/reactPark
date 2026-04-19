import { useEffect } from 'react'
import styles from './ConfirmModal.module.css'

export default function ConfirmModal({ message, onConfirm, onCancel }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnCancel} onClick={onCancel}>Annuler</button>
          <button className={styles.btnConfirm} onClick={onConfirm}>Confirmer</button>
        </div>
      </div>
    </div>
  )
}
