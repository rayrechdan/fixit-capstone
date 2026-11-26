const LABELS = {
  requested: 'Requested',
  accepted: 'Accepted',
  on_the_way: 'On the way',
  done: 'Done',
  cancelled: 'Cancelled',
}

// Coloured label for the status of a job
function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{LABELS[status] || status}</span>
}

export default StatusBadge
