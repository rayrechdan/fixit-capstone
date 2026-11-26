// Shows a rating as stars. If onChange is given, the stars are clickable.
function Stars({ value, onChange }) {
  return (
    <span className="stars" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) =>
        onChange ? (
          <button
            type="button"
            key={n}
            className={n <= value ? 'star on' : 'star'}
            onClick={() => onChange(n)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
          >
            ★
          </button>
        ) : (
          <span key={n} className={n <= Math.round(value) ? 'star on' : 'star'}>★</span>
        )
      )}
    </span>
  )
}

export default Stars
