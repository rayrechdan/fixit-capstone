import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <header className="navbar">
      <Link to="/" className="logo">
        <span className="logo-mark">F</span> Fixit
      </Link>

      <nav className="nav-links">
        <NavLink to="/" end>Services</NavLink>
        {user?.role === 'customer' && <NavLink to="/my-jobs">My jobs</NavLink>}
        {user?.role === 'pro' && <NavLink to="/pro">Dashboard</NavLink>}

        {user ? (
          <>
            <span className="nav-user">Hi, {user.name.split(' ')[0]}</span>
            <button className="btn btn-small btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <Link to="/signup" className="btn btn-small">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Navbar
