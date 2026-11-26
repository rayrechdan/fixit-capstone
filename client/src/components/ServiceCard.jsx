import { Link } from 'react-router-dom'
import { TRADES } from '../trades'
import { formatDuration } from '../format'

// One service in the catalogue. Props come from the parent (Home page).
function ServiceCard({ service }) {
  const trade = TRADES.find((t) => t.value === service.category)

  return (
    <Link to={`/services/${service.id}`} className="card service-card">
      <span className="service-icon" aria-hidden="true">{trade?.icon}</span>
      <div className="service-info">
        <h3>{service.name}</h3>
        <p className="muted">
          {trade?.label} · about {formatDuration(service.estMinutes)}
        </p>
      </div>
      <span className="price">${service.fixedPriceUsd}</span>
    </Link>
  )
}

export default ServiceCard
