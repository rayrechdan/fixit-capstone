import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const BEIRUT = { lat: 33.8938, lng: 35.5018 }

// Listens for clicks on the map and sends the position to the parent
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Moves the map when the position changes (for example after an address search)
function FollowPosition({ position }) {
  const map = useMap()
  useEffect(() => {
    if (position) map.setView([position.lat, position.lng], 16)
  }, [map, position])
  return null
}

// Leaflet map with OpenStreetMap tiles.
// readOnly = just show a location (pro dashboard), otherwise the user can click to pick one.
function MapPicker({ position, onPick, readOnly = false, height = 260 }) {
  const center = position || BEIRUT

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={position ? 16 : 13}
      style={{ height }}
      className="map"
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {position && (
        <CircleMarker center={[position.lat, position.lng]} radius={10} pathOptions={{ color: '#c2410c', fillColor: '#f26b21', fillOpacity: 0.9 }} />
      )}
      {!readOnly && <ClickHandler onPick={onPick} />}
      <FollowPosition position={position} />
    </MapContainer>
  )
}

export default MapPicker
