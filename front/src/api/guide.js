import client from './client'

export async function getGuide(token) {
  const res = await client.get(`/api/guide/${token}`)
  return res.data
}
