import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, UserRole } from '../types'
import { STORAGE_PORTAL, STORAGE_FARMACIA_ID, STORAGE_CLIENTE_ID, STORAGE_DELIVERY_ID } from '../lib/masterPortalStorage'
import { authApi } from '../api'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ user: User } | { error: string }>
  setAuth: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('zas_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = useCallback(async (email: string, password: string) => {
    if (!email || !password) return { error: 'Correo y contraseña requeridos' }
    try {
      const { ok, data } = await authApi.loginWithStatus(email, password)
      if (ok && (data as { token?: string; user?: unknown }).token && (data as { user?: unknown }).user) {
        const d = data as { token: string; user: { role?: string; email?: string; id?: string; nombre?: string; apellido?: string } }
        const normalizedRole = (d.user.role || '').toString().toLowerCase()
        const emailNorm = (d.user.email || email || '').toString().toLowerCase().trim()
        const finalRole: UserRole =
          (normalizedRole === 'master' || normalizedRole === 'admin' || emailNorm === 'admin@zas.com'
            ? 'admin'
            : (normalizedRole as UserRole || 'cliente')) as UserRole

        const u: User = {
          id: d.user.id || '',
          email: d.user.email || email,
          role: finalRole,
          nombre: d.user.nombre,
          apellido: d.user.apellido,
        }
        localStorage.setItem('zas_token', d.token)
        setUser(u)
        localStorage.setItem('zas_user', JSON.stringify(u))
        return { user: u }
      }
      return {
        error:
          (data as { error?: string; message?: string }).error ||
          (data as { message?: string }).message ||
          'Error al iniciar sesión',
      }
    } catch (e) {
      console.error(e)
      return { error: 'No se pudo conectar con el servidor de autenticación' }
    }
  }, [])

  const setAuth = useCallback((token: string, u: User) => {
    localStorage.setItem('zas_token', token)
    const role = (u.role || '').toString().toLowerCase()
    const emailNorm = (u.email || '').toString().toLowerCase().trim()
    const normalized = role === 'master' || emailNorm === 'admin@zas.com' ? { ...u, role: 'admin' as UserRole } : u
    setUser(normalized)
    localStorage.setItem('zas_user', JSON.stringify(normalized))
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('zas_user')
    localStorage.removeItem('zas_token')
    sessionStorage.removeItem(STORAGE_PORTAL)
    sessionStorage.removeItem(STORAGE_FARMACIA_ID)
    sessionStorage.removeItem(STORAGE_CLIENTE_ID)
    sessionStorage.removeItem(STORAGE_DELIVERY_ID)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        setAuth,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
