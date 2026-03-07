import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coords } from '../context/GeolocationContext'
import { VENEZUELA_CENTER } from '../context/GeolocationContext'

// Fix default icon in react-leaflet (webpack/vite)
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = defaultIcon

interface MapPickerProps {
  center?: Coords
  value: Coords | null
  onChange: (coords: Coords) => void
  height?: string
  zoom?: number
}

function LocationMarker({ value, onChange }: { value: Coords | null; onChange: (c: Coords) => void }) {
  const [position, setPosition] = useState<Coords | null>(value)

  useMapEvents({
    click(e) {
      const coords = { lat: e.latlng.lat, lng: e.latlng.lng }
      setPosition(coords)
      onChange(coords)
    },
  })

  useEffect(() => {
    if (value) setPosition(value)
  }, [value?.lat, value?.lng])

  if (!position) return null
  return <Marker position={[position.lat, position.lng]} />
}

export default function MapPicker({ center = VENEZUELA_CENTER, value, onChange, height = '280px', zoom = 6 }: MapPickerProps) {
  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer
        center={[value?.lat ?? center.lat, value?.lng ?? center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker value={value} onChange={onChange} />
      </MapContainer>
    </div>
  )
}
