// Shows the error message from the API and the list of field errors
function FormErrors({ error }) {
  if (!error) return null
  return (
    <div className="alert" role="alert">
      <strong>{error.message}</strong>
      {error.details?.length > 0 && (
        <ul>
          {error.details.map((d) => (
            <li key={d.field + d.message}>{d.message}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FormErrors
