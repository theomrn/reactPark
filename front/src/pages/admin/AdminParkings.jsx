import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Pencil, Map, Trash2 } from 'lucide-react'
import { getParkings, deleteParking } from '../../api/parkings'
import ConfirmModal from '../../components/ConfirmModal'
import styles from './AdminParkings.module.css'

export default function AdminParkings() {
  const [parkings, setParkings] = useState([])
  const [error, setError] = useState(null)
  const [confirmId, setConfirmId] = useState(null)
  const navigate = useNavigate()

  function load() {
    getParkings().then(({ data, error: err }) => {
      if (err) setError(err)
      else setParkings(data)
    }).catch(() => setError('Impossible de charger les parkings.'))
  }

  useEffect(load, [])

  async function handleDeleteConfirmed() {
    const { error: err } = await deleteParking(confirmId)
    setConfirmId(null)
    if (err) setError(err)
    else load()
  }

  return (
    <div className={styles.container}>
      {confirmId !== null && (
        <ConfirmModal
          message="Supprimer ce parking et toutes ses données ?"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmId(null)}
        />
      )}
      <div className={styles.header}>
        <h1>Gestion des parkings</h1>
        <Link to="/admin/parkings/new" className={styles.btnAdd}>+ Ajouter un parking</Link>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Adresse</th>
              <th>Capacité</th>
              <th>Occupation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {parkings.map((p, i) => (
              <tr key={p.id} className={i % 2 === 1 ? styles.alt : ''}>
                <td>{p.name}</td>
                <td>{p.address}</td>
                <td>{p.totalSpots}</td>
                <td>{p.totalSpots - (p.availableSpots ?? 0)} / {p.totalSpots}</td>
                <td className={styles.actions}>
                  <button
                    onClick={() => navigate(`/admin/parkings/${p.id}/edit`)}
                    className={styles.btnEdit}
                    title="Modifier"
                    aria-label="Modifier"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/parkings/${p.id}/map`)}
                    className={styles.btnMap}
                    title="Carte"
                    aria-label="Carte"
                  >
                    <Map size={16} />
                  </button>
                  <button
                    onClick={() => setConfirmId(p.id)}
                    className={styles.btnDelete}
                    title="Supprimer"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {parkings.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.empty}>Aucun parking.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
