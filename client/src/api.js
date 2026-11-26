// Small helper around fetch for every call to our Express API.
// In development Vite forwards /api to localhost:4000 (see vite.config.js).
// In production Vercel forwards /api to the Render server (see vercel.json).
// So the browser always talks to its own domain and the login cookie just works.
const BASE = import.meta.env.VITE_API_URL || ''

export async function api(path, { method = 'GET', body } = {}) {
  const options = {
    method,
    credentials: 'include', // send the login cookie with the request
  }
  if (body) {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body)
  }

  const res = await fetch(`${BASE}/api${path}`, options)
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const error = new Error(data.error?.message || 'Something went wrong, please try again')
    error.status = res.status
    error.details = data.error?.details || []
    throw error
  }
  return data
}
