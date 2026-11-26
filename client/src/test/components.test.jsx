// Front-end tests: npm test
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import ServiceCard from '../components/ServiceCard'
import StatusBadge from '../components/StatusBadge'
import Stars from '../components/Stars'
import ProtectedRoute from '../components/ProtectedRoute'

const service = {
  id: 7,
  category: 'plumbing',
  name: 'Fix a leaking tap',
  fixedPriceUsd: 20,
  estMinutes: 45,
}

describe('ServiceCard', () => {
  test('shows the name, the fixed price and links to the service page', () => {
    render(
      <MemoryRouter>
        <ServiceCard service={service} />
      </MemoryRouter>
    )
    expect(screen.getByText('Fix a leaking tap')).toBeInTheDocument()
    expect(screen.getByText('$20')).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/services/7')
  })
})

describe('StatusBadge', () => {
  test('shows a readable label for each status', () => {
    render(<StatusBadge status="on_the_way" />)
    expect(screen.getByText('On the way')).toBeInTheDocument()
  })
})

describe('Stars', () => {
  test('calls onChange with the clicked number of stars', async () => {
    const picked = []
    render(<Stars value={0} onChange={(n) => picked.push(n)} />)
    await userEvent.click(screen.getByRole('button', { name: '4 stars' }))
    expect(picked).toEqual([4])
  })
})

// Renders a protected page with a fake logged-in user (or nobody)
function renderProtected(user) {
  return render(
    <AuthContext.Provider value={{ user, loading: false }}>
      <MemoryRouter initialEntries={['/my-jobs']}>
        <Routes>
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/pro" element={<p>Pro dashboard</p>} />
          <Route
            path="/my-jobs"
            element={
              <ProtectedRoute role="customer">
                <p>My jobs page</p>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  )
}

describe('ProtectedRoute', () => {
  test('sends visitors who are not logged in to the login page', () => {
    renderProtected(null)
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  test('shows the page to a logged-in customer', () => {
    renderProtected({ id: 1, name: 'Maya', role: 'customer' })
    expect(screen.getByText('My jobs page')).toBeInTheDocument()
  })

  test('sends a pro to their own dashboard', () => {
    renderProtected({ id: 2, name: 'Karim', role: 'pro' })
    expect(screen.getByText('Pro dashboard')).toBeInTheDocument()
  })
})
