import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { planProApi } from '../api'

function isMasterUser(user: { role?: string; email?: string } | null): boolean {
  if (!user) return false
  const role = (user.role || '').toString().toLowerCase()
  const emailNorm = (user.email || '').toString().toLowerCase().trim()
  // Criterios amplios: cualquier usuario master/admin o email admin@zas.com
  // y, en general, cualquier rol distinto a cliente/farmacia/delivery se trata como usuario master.
  if (role === 'master' || role === 'admin' || emailNorm === 'admin@zas.com') return true
  if (role && role !== 'cliente' && role !== 'farmacia' && role !== 'delivery') return true
  return false
}

interface PlanProContextType {
  planProActivo: boolean
  loading: boolean
  refresh: () => Promise<void>
}

const PlanProContext = createContext<PlanProContextType | null>(null)

export function PlanProProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [planProActivo, setPlanProActivo] = useState(false)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (isMasterUser(user)) {
      setPlanProActivo(true)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await planProApi.getSubscription()
      setPlanProActivo(!!data.activo)
    } catch {
      setPlanProActivo(false)
    } finally {
      setLoading(false)
    }
  }, [user])

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
