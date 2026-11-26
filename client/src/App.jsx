import { Routes, Route, Link } from 'react-router-dom'

function Placeholder({ title }) {
  return (
    <main className="container">
      <h1>{title}</h1>
      <p>Coming soon.</p>
    </main>
  )
}

function App() {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">Fixit</Link>
        <Link to="/my-jobs">My jobs</Link>
        <Link to="/pro">Pro dashboard</Link>
        <Link to="/login">Log in</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Placeholder title="Services" />} />
        <Route path="/services/:id" element={<Placeholder title="Service detail" />} />
        <Route path="/my-jobs" element={<Placeholder title="My jobs" />} />
        <Route path="/pro" element={<Placeholder title="Pro dashboard" />} />
        <Route path="/login" element={<Placeholder title="Log in" />} />
        <Route path="/signup" element={<Placeholder title="Sign up" />} />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </>
  )
}

export default App
