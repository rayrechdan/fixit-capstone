import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="container narrow empty-page">
      <h1>Page not found</h1>
      <p className="muted">This page does not exist.</p>
      <Link to="/" className="btn">Back to the services</Link>
    </main>
  )
}

export default NotFound
