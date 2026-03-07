import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { STORAGE_PORTAL, STORAGE_FARMACIA_ID, STORAGE_CLIENTE_ID, STORAGE_DELIVERY_ID } from '../lib/masterPortalStorage'

export type PortalElegido = 'cliente' | 'delivery' | 'farmacia' | 'admin'

interface MasterPortalContextType {
  portalElegido: PortalElegido | null
  farmaciaId: string | null
  clienteId: string | null
  deliveryId: string | null
  setPortal: (portal: PortalElegido, ids?: { farmaciaId?: string; clienteId?: string; deliveryId?: string }) => void
  clearPortal: () => void
}

const MasterPortalContext = createContext<MasterPortalContextType | null>(null)

function readStorage(): { portal: PortalElegido | null; farmaciaId: string | null; clienteId: string | null; deliveryId: string | null } {
  const portal = sessionStorage.getItem(STORAGE_PORTAL) as PortalElegido | null
  return {
    portal: portal && ['cliente', 'delivery', 'farmacia', 'admin'].includes(portal) ? portal : null,
    farmaciaId: sessionStorage.getItem(STORAGE_FARMACIA_ID),
    clienteId: sessionStorage.getItem(STORAGE_CLIENTE_ID),
    deliveryId: sessionStorage.getItem(STORAGE_DELIVERY_ID),
  }
}

export function MasterPortalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(readStorage)

  const setPortal = useCallback((portal: PortalElegido, ids?: { farmaciaId?: string; clienteId?: string; deliveryId?: string }) => {
    sessionStorage.setItem(STORAGE_PORTAL, portal)
    if (ids?.farmaciaId != null) sessionStorage.setItem(STORAGE_FARMACIA_ID, ids.farmaciaId)
    else sessionStorage.removeItem(STORAGE_FARMACIA_ID)
    if (ids?.clienteId != null) sessionStorage.setItem(STORAGE_CLIENTE_ID, ids.clienteId)
    else sessionStorage.removeItem(STORAGE_CLIENTE_ID)
    if (ids?.deliveryId != null) sessionStorage.setItem(STORAGE_DELIVERY_ID, ids.deliveryId)
    else sessionStorage.removeItem(STORAGE_DELIVERY_ID)
    setState(readStorage())
  }, [])

  const clearPortal = useCallback(() => {
    sessionStorage.removeItem(STORAGE_PORTAL)
    sessionStorage.removeItem(STORAGE_FARMACIA_ID)
    sessionStorage.removeItem(STORAGE_CLIENTE_ID)
    sessionStorage.removeItem(STORAGE_DELIVERY_ID)
    setState(readStorage())
  }, [])

  useEffect(() => {
    const onStorage = () => setState(readStorage())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return (
    <MasterPortalContext.Provider
      value={{
        portalElegido: state.portal,
        farmaciaId: state.farmaciaId,
        clienteId: state.clienteId,
        deliveryId: state.deliveryId,
        setPortal,
        clearPortal,
      }}
    >
      {children}
    </MasterPortalContext.Provider>
  )
}

export function useMasterPortal() {
  const ctx = useContext(MasterPortalContext)
  if (!ctx) throw new Error('useMasterPortal debe usarse dentro de MasterPortalProvider')
  return ctx
}

