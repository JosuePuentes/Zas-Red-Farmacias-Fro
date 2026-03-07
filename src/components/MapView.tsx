import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Coords } from '../context/GeolocationContext'
import { VENEZUELA_CENTER } from '../context/GeolocationContext'

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface MapViewProps {
  /** Centro del mapa (ej. Venezuela) */
  center?: Coords
  /** Marcador de posición del delivery */
  deliveryPosition?: Coords | null
  /** Marcador de ubicación del cliente/entrega */
  destinoPosition?: Coords | null
  height?: string
  zoom?: number
  /** Si true, el mapa se ajusta para mostrar ambos marcadores */
  fitBounds?: boolean
}

function FitBounds({ delivery, destino }: { delivery?: Coords | null; destino?: Coords | null }) {
  const map = useMap()
  useEffect(() => {
    if (!delivery && !destino) return
    const points: [number, number][] = []
    if (delivery) points.push([delivery.lat, delivery.lng])
    if (destino) points.push([destino.lat, destino.lng])
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 15)
      return
    }
    const bounds: L.LatLngBoundsLiteral = [points[0], points[1]]
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 })
  }, [map, delivery?.lat, delivery?.lng, destino?.lat, destino?.lng])
  return null
}

export default function MapView({
  center = VENEZUELA_CENTER,
  deliveryPosition = null,
  destinoPosition = null,
  height = '300px',
  zoom = 6,
  fitBounds = false,
}: MapViewProps) {
  const hasMarkers = deliveryPosition || destinoPosition

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {fitBounds && hasMarkers && <FitBounds delivery={deliveryPosition} destino={destinoPosition} />}
        {deliveryPosition && (
          <Marker position={[deliveryPosition.lat, deliveryPosition.lng]} icon={defaultIcon} />
        )}
        {destinoPosition && (
          <Marker position={[destinoPosition.lat, destinoPosition.lng]} icon={defaultIcon} />
        )}
      </MapContainer>
    </div>
  )
}
