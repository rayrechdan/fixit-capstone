import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { tradeLabel } from '../trades'
import Stars from '../components/Stars'

// Public profile of a pro: trade, average rating and the latest reviews
function ProProfile() {
  const { id } = useParams()
  const [pro, setPro] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api(`/pros/${id}`)
      .then((data) => setPro(data.data))
      .catch((err) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <main className="container">
        <p className="alert">{error}</p>
        <Link to="/">Back to the services</Link>
      </main>
    )
  }
  if (!pro) return <p className="container muted">Loading...</p>

  return (
    <main className="container narrow">
      <section className="card profile">
        <div className="avatar" aria-hidden="true">{pro.name[0]}</div>
        <h1>{pro.name}</h1>
        <p className="eyebrow">{tradeLabel(pro.trade)}</p>
        {pro.averageRating ? (
          <p>
            <Stars value={pro.averageRating} /> <strong>{pro.averageRating}</strong>{' '}
            <span className="muted">({pro.reviewCount} review{pro.reviewCount > 1 ? 's' : ''})</span>
          </p>
        ) : (
          <p className="muted">No reviews yet</p>
        )}
        <p className="muted">{pro.jobsDone} jobs done on Fixit</p>
      </section>

      <h2>Reviews</h2>
      {pro.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
      {pro.reviews.map((r) => (
        <article key={r.id} className="card review">
          <Stars value={r.rating} />
          {r.comment && <p>“{r.comment}”</p>}
          <p className="muted small">
            {r.customer} · {r.service} · {new Date(r.createdAt).toLocaleDateString('en-GB')}
          </p>
        </article>
      ))}
    </main>
  )
}

export default ProProfile
