import client from './client'

export async function getMyReservations() {
  const res = await client.get('/api/reservations/mine')
  return res.data
}

export async function getReservationById(id) {
  const res = await client.get(`/api/reservations/${id}`)
  return res.data
}

export async function createReservation(data) {
  const res = await client.post('/api/reservations', data)
  return res.data
}

export async function cancelReservation(id) {
  const res = await client.delete(`/api/reservations/${id}`)
  return res.data
}
