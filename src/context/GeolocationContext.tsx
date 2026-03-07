import React, { createContext, useContext, useState, useCallback } from 'react'

export interface Coords {
  lat: number
  lng: number
}

interface GeolocationContextType {
  position: Coords | null
  error: string | null
  loading: boolean
  permissionAsked: boolean
  requestLocation: () => Promise<Coords | null>
  clearError: () => void
  dismissLocationPrompt: () => void
}

const VENEZUELA_CENTER: Coords = { lat: 6.4238, lng: -66.5897 }

const GeolocationContext = createContext<GeolocationContextType | null>(null)

const STORAGE_KEY = 'zas_location_prompt_dismissed'

export function GeolocationProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState<Coords | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [permissionAsked, setPermissionAsked] = useState(() => !!localStorage.getItem(STORAGE_KEY))

  const requestLocation = useCallback((): Promise<Coords | null> => {
    if (!navigator.geolocation) {
      setError('Tu navegador no soporta geolocalización.')
      return Promise.resolve(null)
    }
    setError(null)
    setLoading(true)
    setPermissionAsked(true)
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: Coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
          setPosition(coords)
          setLoading(false)
          resolve(coords)
        },
        (err) => {
          const msg =
            err.code === 1
              ? 'Debes activar la ubicación (GPS) para usar esta función.'
              : err.code === 2
                ? 'No se pudo obtener tu ubicación.'
                : 'Tiempo de espera agotado. Intenta de nuevo.'
          setError(msg)
          setLoading(false)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      )
    })
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const dismissLocationPrompt = useCallback(() => {
    setPermissionAsked(true)
    localStorage.setItem(STORAGE_KEY, '1')
  }, [])

  return (
    <GeolocationContext.Provider
      value={{
        position,
        error,
        loading,
        permissionAsked,
        requestLocation,
        clearError,
        dismissLocationPrompt,
      }}
    >
      {children}
    </GeolocationContext.Provider>
  )
}

export function useGeolocation() {
  const ctx = useContext(GeolocationContext)
  if (!ctx) throw new Error('useGeolocation debe usarse dentro de GeolocationProvider')
  return ctx
}

export { VENEZUELA_CENTER }
