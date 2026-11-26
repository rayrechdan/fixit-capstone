// Third-party API: OpenStreetMap Nominatim (free, no API key needed)
// https://nominatim.org/release-docs/latest/api/Search/
// Their usage policy allows about 1 request per second and no search-as-you-type,
// so we only search when the user clicks the "Find" button.
const NOMINATIM = 'https://nominatim.openstreetmap.org'

// Text -> list of places with coordinates (limited to Lebanon)
export async function searchAddress(text) {
  const url = `${NOMINATIM}/search?format=json&limit=5&countrycodes=lb&q=${encodeURIComponent(text)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('The address search is not available right now')
  const results = await res.json()
  return results.map((r) => ({ label: r.display_name, lat: Number(r.lat), lng: Number(r.lon) }))
}

// Coordinates -> address text (used when the user clicks on the map)
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM}/reverse?format=json&zoom=18&lat=${lat}&lon=${lng}`
  const res = await fetch(url)
  if (!res.ok) return ''
  const data = await res.json()
  return data.display_name || ''
}
