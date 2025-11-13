const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  baseUrl: BASE_URL,
  createSeller: (data) => request('/api/sellers', { method: 'POST', body: JSON.stringify(data) }),
  listSellers: () => request('/api/sellers'),

  createProduct: (data) => request('/api/products', { method: 'POST', body: JSON.stringify(data) }),
  listProducts: (sellerId) => request(`/api/products${sellerId ? `?seller_id=${sellerId}` : ''}`),

  createStream: (data) => request('/api/streams', { method: 'POST', body: JSON.stringify(data) }),
  listStreams: (active) => request(`/api/streams${active !== undefined ? `?active=${active}` : ''}`),
  getStream: (id) => request(`/api/streams/${id}`),

  createOrder: (data) => request('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
}
