import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Shows the page only to logged-in users with the right role.
// Note: this is only for the user experience. The real protection is on the
// server (requireAuth and requireRole), because anyone can change front-end code.
function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p className="container">Loading...</p>

  if (!user) {
    // remember where the user wanted to go, to come back after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'pro' ? '/pro' : '/my-jobs'} replace />
  }

  return children
}

export default ProtectedRoute
