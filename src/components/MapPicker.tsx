import { useCallback, useMemo, useState } from 'react'
import { GoogleMap, Marker, Autocomplete, useJsApiLoader } from '@react-google-maps/api'
import type { Coords } from '../context/GeolocationContext'
import { VENEZUELA_CENTER } from '../context/GeolocationContext'

interface MapPickerProps {
  center?: Coords
  value: Coords | null
  onChange: (coords: Coords) => void
  height?: string
  zoom?: number
}

export default function MapPicker({ center = VENEZUELA_CENTER, value, onChange, height = '280px', zoom = 6 }: MapPickerProps) {
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)
  const [mapCenter, setMapCenter] = useState<Coords>(value || center)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: apiKey || '',
    libraries: ['places'],
  })

  const zuliaBounds = useMemo<google.maps.LatLngBoundsLiteral>(
    () => ({
      north: 11.2,
      south: 9.0,
      east: -71.0,
      west: -73.5,
    }),
    [],
  )

  const handlePlaceChanged = useCallback(() => {
    if (!autocomplete) return
    const place = autocomplete.getPlace()
    if (!place.geometry || !place.geometry.location) return
    const lat = place.geometry.location.lat()
    const lng = place.geometry.location.lng()
    const coords = { lat, lng }
    setMapCenter(coords)
    onChange(coords)

    const inside =
      lat <= zuliaBounds.north &&
      lat >= zuliaBounds.south &&
      lng <= zuliaBounds.east &&
      lng >= zuliaBounds.west
    if (!inside) {
      // Aviso simple si está fuera de la zona de cobertura
      // (no bloqueamos, solo informamos)
      // eslint-disable-next-line no-alert
      alert('La ubicación seleccionada parece estar fuera de la zona de cobertura principal (Zulia).')
    }
  }, [autocomplete, onChange, zuliaBounds])

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
        center={value || mapCenter}
        zoom={zoom}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          restriction: {
            latLngBounds: zuliaBounds,
            strictBounds: false,
          },
        }}
        onClick={(e) => {
          if (!e.latLng) return
          const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
          setMapCenter(coords)
          onChange(coords)
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            width: '80%',
            maxWidth: 420,
          }}
        >
          <Autocomplete
            onLoad={(ac) => setAutocomplete(ac)}
            onPlaceChanged={handlePlaceChanged}
            options={{
              bounds: zuliaBounds,
              strictBounds: false,
              componentRestrictions: { country: 've' },
            }}
          >
            <input
              type="text"
              placeholder="Buscar dirección de la farmacia..."
              style={{
                width: '100%',
                padding: '0.4rem 0.6rem',
                borderRadius: 999,
                border: '1px solid #d1d5db',
                fontSize: '0.9rem',
              }}
            />
          </Autocomplete>
        </div>
        {value && (
          <Marker
            position={value}
            draggable
            onDragEnd={(e) => {
              if (!e.latLng) return
              const coords = { lat: e.latLng.lat(), lng: e.latLng.lng() }
              setMapCenter(coords)
              onChange(coords)
            }}
          />
        )}
      </GoogleMap>
    </div>
  )
}
