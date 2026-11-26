import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { tradeLabel } from '../trades'
import { formatDuration } from '../format'
import { searchAddress, reverseGeocode } from '../geocode'
import MapPicker from '../components/MapPicker'
import FormErrors from '../components/FormErrors'

// The earliest time a customer can book: one hour from now, as "YYYY-MM-DDTHH:mm"
function minDateTime() {
  const d = new Date(Date.now() + 60 * 60 * 1000)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function ServiceDetail() {
  const { id } = useParams() // the :id in /services/:id
  const { user } = useAuth()
  const navigate = useNavigate()

  const [service, setService] = useState(null)
  const [notFound, setNotFound] = useState(false)

  // booking form
  const [address, setAddress] = useState('')
  const [position, setPosition] = useState(null)
  const [results, setResults] = useState([])
  const [scheduledAt, setScheduledAt] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState(null)
  const [searching, setSearching] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api(`/services/${id}`)
      .then((data) => setService(data.data))
      .catch(() => setNotFound(true))
  }, [id])

  async function handleFind() {
    if (!address.trim()) return
    setSearching(true)
    setResults([])
    try {
      const places = await searchAddress(address)
      if (places.length === 0) setError({ message: 'No place found, try another address or click on the map' })
      else setError(null)
      setResults(places)
    } catch (err) {
      setError({ message: err.message })
    } finally {
      setSearching(false)
    }
  }

  function choosePlace(place) {
    setPosition({ lat: place.lat, lng: place.lng })
    setAddress(place.label)
    setResults([])
  }

  async function handleMapClick(pos) {
    setPosition(pos)
    const label = await reverseGeocode(pos.lat, pos.lng)
    if (label) setAddress(label)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!position) {
      setError({ message: 'Please pick the location on the map' })
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await api('/jobs', {
        method: 'POST',
        body: {
          serviceId: service.id,
          address,
          lat: position.lat,
          lng: position.lng,
          // datetime-local has no time zone, new Date() reads it as local time
          scheduledAt: new Date(scheduledAt).toISOString(),
          description,
        },
      })
      navigate('/my-jobs')
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (notFound) {
    return (
      <main className="container">
        <h1>Service not found</h1>
        <Link to="/">Back to the services</Link>
      </main>
    )
  }
  if (!service) return <p className="container muted">Loading...</p>

  return (
    <main className="container detail">
      <section className="card detail-info">
        <Link to="/" className="muted">← All services</Link>
        <p className="eyebrow">{tradeLabel(service.category)}</p>
        <h1>{service.name}</h1>
        <p>{service.description}</p>
        <div className="detail-facts">
          <div>
            <span className="price big">${service.fixedPriceUsd}</span>
            <span className="muted">fixed price</span>
          </div>
          <div>
            <strong>{formatDuration(service.estMinutes)}</strong>
            <span className="muted">estimated time</span>
          </div>
        </div>
        <p className="muted small">The price is fixed when you book. It does not change when the pro arrives.</p>
      </section>

      <section className="card">
        <h2>Book this repair</h2>

        {!user && (
          <p>
            <Link to="/login" state={{ from: `/services/${service.id}` }} className="btn">Log in to book</Link>
          </p>
        )}
        {user?.role === 'pro' && <p className="muted">You are logged in as a pro. Only customers can book.</p>}

        {user?.role === 'customer' && (
          <form className="form" onSubmit={handleSubmit}>
            <FormErrors error={error} />

            <label htmlFor="address">Address</label>
            <div className="row">
              <input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street, area, e.g. Hamra Street"
                required
              />
              <button type="button" className="btn btn-dark" onClick={handleFind} disabled={searching}>
                {searching ? '...' : 'Find'}
              </button>
            </div>

            {results.length > 0 && (
              <ul className="results">
                {results.map((place) => (
                  <li key={`${place.lat},${place.lng}`}>
                    <button type="button" onClick={() => choosePlace(place)}>{place.label}</button>
                  </li>
                ))}
              </ul>
            )}

            <p className="muted small">Search the address or click on the map to place the pin.</p>
            <MapPicker position={position} onPick={handleMapClick} />

            <label>
              Date and time
              <input
                type="datetime-local"
                value={scheduledAt}
                min={minDateTime()}
                onChange={(e) => setScheduledAt(e.target.value)}
                required
              />
            </label>
            <label>
              What is the problem?
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. The kitchen tap drips all the time"
                maxLength={1000}
                required
              />
            </label>

            <button className="btn btn-block" disabled={submitting}>
              {submitting ? 'Booking...' : `Book for $${service.fixedPriceUsd}`}
            </button>
          </form>
        )}
      </section>
    </main>
  )
}

export default ServiceDetail
