const STEPS = ['requested', 'accepted', 'on_the_way', 'done']
const LABELS = ['Requested', 'Accepted', 'On the way', 'Done']

// The progress bar: requested -> accepted -> on the way -> done
function StatusSteps({ status }) {
  const current = STEPS.indexOf(status)
  return (
    <ol className="steps">
      {STEPS.map((step, i) => (
        <li key={step} className={i <= current ? 'reached' : ''}>
          {LABELS[i]}
        </li>
      ))}
    </ol>
  )
}

export default StatusSteps
