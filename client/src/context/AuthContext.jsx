import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../api'

// Shares the logged-in user with every component (no prop drilling)
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // When the page loads, ask the server if the login cookie is still valid
  useEffect(() => {
    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const data = await api('/auth/login', { method: 'POST', body: { email, password } })
    setUser(data.user)
    return data.user
  }

  async function signup(form) {
    const data = await api('/auth/signup', { method: 'POST', body: form })
    setUser(data.user)
    return data.user
  }

  async function logout() {
    await api('/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
