import { useEffect, useMemo } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import type { Coords } from '../context/GeolocationContext'
import { VENEZUELA_CENTER } from '../context/GeolocationContext'

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

export default function MapView({
  center = VENEZUELA_CENTER,
  deliveryPosition = null,
  destinoPosition = null,
  height = '300px',
  zoom = 6,
  fitBounds = false,
}: MapViewProps) {
  const hasMarkers = deliveryPosition || destinoPosition
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
  })

  const bounds = useMemo<google.maps.LatLngBounds | null>(() => {
    if (!fitBounds || !hasMarkers) return null
    const b = new google.maps.LatLngBounds()
    if (deliveryPosition) b.extend({ lat: deliveryPosition.lat, lng: deliveryPosition.lng })
    if (destinoPosition) b.extend({ lat: destinoPosition.lat, lng: destinoPosition.lng })
    return b
  }, [fitBounds, hasMarkers, deliveryPosition?.lat, deliveryPosition?.lng, destinoPosition?.lat, destinoPosition?.lng])

  useEffect(() => {
    // Google Maps ajusta bounds en el onLoad del mapa (ver abajo)
  }, [bounds])

  if (!apiKey) {
    return <p className="auth-error">Falta configurar VITE_GOOGLE_MAPS_API_KEY para mostrar el mapa.</p>
  }

  if (!isLoaded) {
    return <p className="muted">Cargando mapa...</p>
  }

  return (
    <div style={{ height, width: '100%', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <GoogleMap
        mapContainerStyle={{ height: '100%', width: '100%' }}
        center={center}
        zoom={zoom}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        }}
        onLoad={(map) => {
          if (bounds) {
            map.fitBounds(bounds, { padding: 40 })
          }
        }}
      >
        {deliveryPosition && <Marker position={deliveryPosition} />}
        {destinoPosition && <Marker position={destinoPosition} />}
      </GoogleMap>
    </div>
  )
}
