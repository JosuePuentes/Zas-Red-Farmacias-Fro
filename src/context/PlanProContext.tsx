import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { planProApi } from '../api'

interface PlanProContextType {
  planProActivo: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const PlanProContext = createContext<PlanProContextType | null>(null)

export function PlanProProvider({ children }: { children: React.ReactNode }) {
  const [planProActivo, setPlanProActivo] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await planProApi.getSubscription()
      setPlanProActivo(!!data.activo)
    } catch {
      setPlanProActivo(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return (
    <PlanProContext.Provider value={{ planProActivo, loading, refresh }}>
      {children}
    </PlanProContext.Provider>
  )
}

export function usePlanPro() {
  const ctx = useContext(PlanProContext)
  if (!ctx) throw new Error('usePlanPro debe usarse dentro de PlanProProvider')
  return ctx
}
