import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatDate } from '../format'
import StatusBadge from '../components/StatusBadge'
import StatusSteps from '../components/StatusSteps'
import ReviewForm from '../components/ReviewForm'
import Stars from '../components/Stars'

const REFRESH_EVERY = 15000 // 15 seconds

// Customer page: the jobs I booked, with their live status
function MyJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // useCallback keeps the same function between renders, so useEffect does not loop
  const loadJobs = useCallback(() => {
    api('/jobs/mine')
      .then((data) => {
        setJobs(data.data)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  // Load now, then refresh every 15 s so the status updates by itself.
  // The cleanup function stops the timer when we leave the page.
  useEffect(() => {
    loadJobs()
    const timer = setInterval(loadJobs, REFRESH_EVERY)
    return () => clearInterval(timer)
  }, [loadJobs])

  async function cancelJob(id) {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await api(`/jobs/${id}/cancel`, { method: 'PATCH' })
      loadJobs()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <p className="container muted">Loading your jobs...</p>

  return (
    <main className="container">
      <div className="page-head">
        <h1>My jobs</h1>
        <Link to="/" className="btn btn-small">Book a repair</Link>
      </div>
      {error && <p className="alert">{error}</p>}

      {jobs.length === 0 && (
        <div className="card empty">
          <p>You have not booked anything yet.</p>
          <Link to="/">Browse the services</Link>
        </div>
      )}

      <div className="job-list">
        {jobs.map((job) => (
          <article key={job.id} className="card job">
            <div className="job-head">
              <h3>{job.service.name}</h3>
              <StatusBadge status={job.status} />
            </div>
            <p className="muted">
              {formatDate(job.scheduledAt)} · ${job.priceUsd}
            </p>
            <p className="muted small">{job.address}</p>

            {job.status !== 'cancelled' && <StatusSteps status={job.status} />}

            {job.pro ? (
              <p>
                Your pro: <Link to={`/pros/${job.pro.id}`}>{job.pro.name}</Link>
                {job.pro.phone && job.status !== 'done' && <span className="muted"> · {job.pro.phone}</span>}
              </p>
            ) : (
              job.status === 'requested' && <p className="muted">Waiting for a pro to accept...</p>
            )}

            {job.status === 'requested' && (
              <button className="btn btn-small btn-ghost" onClick={() => cancelJob(job.id)}>
                Cancel booking
              </button>
            )}

            {job.status === 'done' && !job.review && <ReviewForm jobId={job.id} onSaved={loadJobs} />}
            {job.review && (
              <p className="small">
                Your review: <Stars value={job.review.rating} /> {job.review.comment}
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  )
}

export default MyJobs
