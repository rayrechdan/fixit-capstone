import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import ServiceDetail from './pages/ServiceDetail'
import Login from './pages/Login'
import Signup from './pages/Signup'
import MyJobs from './pages/MyJobs'
import ProDashboard from './pages/ProDashboard'
import ProProfile from './pages/ProProfile'
import NotFound from './pages/NotFound'

// Client-side routing: React Router shows a different page for each URL
// without reloading the whole page from the server
function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services/:id" element={<ServiceDetail />} />
        <Route path="/pros/:id" element={<ProProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute role="customer">
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pro"
          element={
            <ProtectedRoute role="pro">
              <ProDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <footer className="footer">
        Fixit · Web Programming capstone · Raymond Rechdan &amp; Ralph Assi
      </footer>
    </>
  )
}

export default App
