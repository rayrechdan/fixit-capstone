import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { tradeLabel } from '../trades'
import { formatDate } from '../format'
import StatusBadge from '../components/StatusBadge'
import MapPicker from '../components/MapPicker'

const REFRESH_EVERY = 15000

// The next step a pro can take for each status, with the button text
const NEXT_STEP = {
  accepted: { status: 'on_the_way', label: "I'm on my way" },
  on_the_way: { status: 'done', label: 'Mark as done' },
}

function ProDashboard() {
  const { user } = useAuth()
  const [openJobs, setOpenJobs] = useState([])
  const [myJobs, setMyJobs] = useState([])
  const [showMap, setShowMap] = useState(null) // id of the job whose map is open
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  const loadJobs = useCallback(() => {
    // the two requests run at the same time
    Promise.all([api('/jobs/open'), api('/jobs/mine')])
      .then(([open, mine]) => {
        setOpenJobs(open.data)
        setMyJobs(mine.data)
      })
      .catch((err) => setMessage(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    loadJobs()
    const timer = setInterval(loadJobs, REFRESH_EVERY)
    return () => clearInterval(timer)
  }, [loadJobs])

  async function acceptJob(id) {
    try {
      await api(`/jobs/${id}/accept`, { method: 'PATCH' })
      setMessage('Job accepted. It is now in your jobs below.')
    } catch (err) {
      // 409 = another pro was faster
      setMessage(err.message)
    }
    loadJobs()
  }

  async function moveForward(job) {
    try {
      await api(`/jobs/${job.id}/status`, { method: 'PATCH', body: { status: NEXT_STEP[job.status].status } })
      setMessage('')
    } catch (err) {
      setMessage(err.message)
    }
    loadJobs()
  }

  if (loading) return <p className="container muted">Loading the dashboard...</p>

  const activeJobs = myJobs.filter((j) => j.status !== 'done')
  const doneJobs = myJobs.filter((j) => j.status === 'done')
  const earned = doneJobs.reduce((sum, j) => sum + j.priceUsd, 0)

  return (
    <main className="container">
      <div className="page-head">
        <h1>Hi {user.name.split(' ')[0]}</h1>
        <Link to={`/pros/${user.id}`} className="muted">My public profile →</Link>
      </div>

      <div className="stats">
        <div className="card stat"><strong>{openJobs.length}</strong><span>open in {tradeLabel(user.trade)}</span></div>
        <div className="card stat"><strong>{activeJobs.length}</strong><span>in progress</span></div>
        <div className="card stat"><strong>${earned}</strong><span>earned ({doneJobs.length} done)</span></div>
      </div>

      {message && <p className="alert info">{message}</p>}

      <h2>Open jobs in {tradeLabel(user.trade)}</h2>
      {openJobs.length === 0 && <p className="muted">No open jobs right now. This list refreshes by itself.</p>}
      <div className="job-list">
        {openJobs.map((job) => (
          <article key={job.id} className="card job">
            <div className="job-head">
              <h3>{job.service.name}</h3>
              <span className="price">${job.priceUsd}</span>
            </div>
            <p className="muted">{formatDate(job.scheduledAt)}</p>
            <p className="small">{job.address}</p>
            <p className="small quote">“{job.description}”</p>
            <div className="row">
              <button className="btn btn-small" onClick={() => acceptJob(job.id)}>Accept job</button>
              <button className="btn btn-small btn-ghost" onClick={() => setShowMap(showMap === job.id ? null : job.id)}>
                {showMap === job.id ? 'Hide map' : 'Show map'}
              </button>
            </div>
            {showMap === job.id && <MapPicker position={{ lat: job.lat, lng: job.lng }} readOnly height={200} />}
          </article>
        ))}
      </div>

      <h2>My jobs</h2>
      {myJobs.length === 0 && <p className="muted">Jobs you accept will appear here.</p>}
      <div className="job-list">
        {myJobs.map((job) => (
          <article key={job.id} className="card job">
            <div className="job-head">
              <h3>{job.service.name}</h3>
              <StatusBadge status={job.status} />
            </div>
            <p className="muted">{formatDate(job.scheduledAt)} · ${job.priceUsd}</p>
            <p className="small">
              {job.customer.name}
              {job.customer.phone && ` · ${job.customer.phone}`}
            </p>
            <p className="small">{job.address}</p>
            {NEXT_STEP[job.status] && (
              <button className="btn btn-small btn-dark" onClick={() => moveForward(job)}>
                {NEXT_STEP[job.status].label}
              </button>
            )}
            {job.review && <p className="small">Rated {job.review.rating}/5 {job.review.comment && `· “${job.review.comment}”`}</p>}
          </article>
        ))}
      </div>
    </main>
  )
}

export default ProDashboard
