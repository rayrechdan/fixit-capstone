import { useEffect, useState } from 'react'
import { api } from '../api'
import { TRADES } from '../trades'
import ServiceCard from '../components/ServiceCard'

function Home() {
  const [services, setServices] = useState([])
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('') // what is typed in the box
  const [query, setQuery] = useState('') // what we actually search for
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Reload the catalogue every time the category or the search changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (query) params.set('q', query)

    setLoading(true)
    setError('')
    api(`/services?${params}`)
      .then((data) => setServices(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, query])

  function handleSearch(e) {
    e.preventDefault()
    setQuery(search.trim())
  }

  return (
    <main>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Home repairs in Beirut</p>
          <h1>Fixed price. Fixed right.</h1>
          <p className="hero-text">
            Pick a repair, see the price before you book, and follow your pro until the job is done.
          </p>
          <form className="search" onSubmit={handleSearch}>
            <input
              type="search"
              placeholder="What needs fixing? e.g. tap, AC, socket"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search services"
            />
            <button className="btn">Search</button>
          </form>
        </div>
      </section>

      <section className="container">
        <div className="chips" role="group" aria-label="Filter by trade">
          <button className={category === '' ? 'chip active' : 'chip'} onClick={() => setCategory('')}>
            All
          </button>
          {TRADES.map((t) => (
            <button
              key={t.value}
              className={category === t.value ? 'chip active' : 'chip'}
              onClick={() => setCategory(t.value)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading && <p className="muted">Loading services...</p>}
        {error && <p className="alert">{error}</p>}
        {!loading && !error && services.length === 0 && (
          <p className="muted">No service matches your search.</p>
        )}

        <div className="grid">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </main>
  )
}

export default Home
