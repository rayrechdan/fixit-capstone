import { useState } from 'react'
import { api } from '../api'
import Stars from './Stars'

// Lets the customer rate the pro after the job is done
function ReviewForm({ jobId, onSaved }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) {
      setError('Choose from 1 to 5 stars')
      return
    }
    try {
      await api(`/jobs/${jobId}/review`, { method: 'POST', body: { rating, comment } })
      onSaved() // tell the parent to reload the jobs
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <p><strong>How was the job?</strong></p>
      <Stars value={rating} onChange={setRating} />
      <textarea
        rows={2}
        placeholder="Optional comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={500}
      />
      {error && <p className="error-text">{error}</p>}
      <button className="btn btn-small">Send review</button>
    </form>
  )
}

export default ReviewForm
