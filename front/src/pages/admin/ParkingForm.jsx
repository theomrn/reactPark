import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save } from 'lucide-react'
import { getParkingById, createParking, updateParking } from '../../api/parkings'
import styles from './ParkingForm.module.css'

export default function ParkingForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [totalSpots, setTotalSpots] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    getParkingById(id).then(({ data, error: err }) => {
      if (err) setError(err)
      else {
        setName(data.name)
        setAddress(data.address)
        setTotalSpots(data.totalSpots)
      }
      setLoading(false)
    }).catch(() => { setError('Impossible de charger le parking.'); setLoading(false) })
  }, [id, isEdit])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    const payload = { name, address, ...(isEdit ? {} : { totalSpots: parseInt(totalSpots) }) }
    try {
      const { error: err } = isEdit
        ? await updateParking(id, payload)
        : await createParking(payload)
      if (err) { setError(err); return }
      navigate('/admin/parkings')
    } catch {
      setError('Erreur lors de la sauvegarde.')
    }
  }

  if (loading) return <p className={styles.loading}>Chargement...</p>

  return (
    <div className={styles.container}>
      <Link to="/admin/parkings" className={styles.back}>← Retour</Link>
      <div className={styles.card}>
        <h1>{isEdit ? 'Modifier le parking' : 'Ajouter un parking'}</h1>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <label>
            Nom
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex : Parking Centre-ville"
              required
            />
          </label>
          <label>
            Adresse
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Ex : 12 rue de la Paix, Paris"
              required
            />
          </label>
          {!isEdit && (
            <label>
              Nombre de places
              <input
                type="number"
                min="1"
                value={totalSpots}
                onChange={e => setTotalSpots(e.target.value)}
                placeholder="Ex : 50"
                required
              />
            </label>
          )}
          <div className={styles.buttons}>
            <button type="submit" className={styles.btn}>
              <Save size={15} />
              {isEdit ? 'Enregistrer' : 'Créer le parking'}
            </button>
            <Link to="/admin/parkings" className={styles.btnCancel}>Annuler</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
