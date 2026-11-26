import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import FormErrors from '../components/FormErrors'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Controlled inputs: React state is the single source of truth
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault() // stop the browser from reloading the page
    setError(null)
    setSubmitting(true)
    try {
      const user = await login(email, password)
      const home = user.role === 'pro' ? '/pro' : '/my-jobs'
      navigate(location.state?.from || home, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="container auth-page">
      <form className="card form" onSubmit={handleSubmit}>
        <h1>Log in</h1>
        <FormErrors error={error} />

        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </label>

        <button className="btn" disabled={submitting}>{submitting ? 'Logging in...' : 'Log in'}</button>
        <p className="muted">
          No account yet? <Link to="/signup">Sign up</Link>
        </p>
      </form>
    </main>
  )
}

export default Login
