import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormErrors from '../components/FormErrors'
import { TRADES } from '../trades'

function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()

  // One state object for the whole form
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'customer', trade: '' })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // One change handler for every input, using the input's name
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user = await signup(form)
      navigate(user.role === 'pro' ? '/pro' : '/')
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container auth-page">
      <form className="card form" onSubmit={handleSubmit}>
        <h1>Create an account</h1>
        <FormErrors error={error} />

        <div className="role-switch">
          <label className={form.role === 'customer' ? 'active' : ''}>
            <input type="radio" name="role" value="customer" checked={form.role === 'customer'} onChange={handleChange} />
            I need a repair
          </label>
          <label className={form.role === 'pro' ? 'active' : ''}>
            <input type="radio" name="role" value="pro" checked={form.role === 'pro'} onChange={handleChange} />
            I am a pro
          </label>
        </div>

        <label>
          Full name
          <input name="name" value={form.name} onChange={handleChange} required autoComplete="name" />
        </label>
        <label>
          Email
          <input type="email" name="email" value={form.email} onChange={handleChange} required autoComplete="email" />
        </label>
        <label>
          Phone (optional)
          <input type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" />
        </label>
        <label>
          Password (at least 8 characters)
          <input type="password" name="password" value={form.password} onChange={handleChange} minLength={8} required autoComplete="new-password" />
        </label>

        {/* Only pros pick a trade */}
        {form.role === 'pro' && (
          <label>
            Your trade
            <select name="trade" value={form.trade} onChange={handleChange} required>
              <option value="">Choose a trade</option>
              {TRADES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
        )}

        <button className="btn" disabled={submitting}>{submitting ? 'Creating account...' : 'Sign up'}</button>
        <p className="muted">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  )
}

export default Signup
