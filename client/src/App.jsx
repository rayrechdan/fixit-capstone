import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Signup from './pages/Signup'

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
      <Navbar />
      <Routes>
        <Route path="/" element={<Placeholder title="Services" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute role="customer">
              <Placeholder title="My jobs" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro"
          element={
            <ProtectedRoute role="pro">
              <Placeholder title="Pro dashboard" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Placeholder title="Page not found" />} />
      </Routes>
    </>
  )
}

export default App
