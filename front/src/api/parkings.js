import client from './client'

export async function getParkings() {
  const res = await client.get('/api/parkings')
  return res.data
}

export async function getParkingById(id) {
  const res = await client.get(`/api/parkings/${id}`)
  return res.data
}

export async function createParking(data) {
  const res = await client.post('/api/parkings', data)
  return res.data
}

export async function updateParking(id, data) {
  const res = await client.put(`/api/parkings/${id}`, data)
  return res.data
}

export async function deleteParking(id) {
  const res = await client.delete(`/api/parkings/${id}`)
  return res.data
}

export async function updateParkingMap(id, data) {
  const res = await client.put(`/api/parkings/${id}/map`, data)
  return res.data
}
