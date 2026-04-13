import client from './client'

export async function getParkingStats() {
  const res = await client.get('/api/stats/parkings')
  return res.data
}

export async function getReservationStats() {
  const res = await client.get('/api/stats/reservations')
  return res.data
}
