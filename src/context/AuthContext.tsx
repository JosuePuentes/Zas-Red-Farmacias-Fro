import React, { createContext, useContext, useState, useCallback } from 'react'
import type { User, UserRole } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ user: User } | { error: string }>
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
    // TODO: reemplazar por llamada al backend; normalizar role igual (master / admin@zas.com → admin)
    // const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })
    // const data = await res.json(); if (data.user) setUser(normalizeUser(data.user)); return data
    if (!email || !password) return { error: 'Correo y contraseña requeridos' }
    let role = (localStorage.getItem('zas_mock_role') as UserRole) || 'cliente'
    const emailNorm = email.trim().toLowerCase()
    if (role === 'master' || emailNorm === 'admin@zas.com') role = 'admin'
    const mockUser: User = {
      id: '1',
      email,
      role,
      nombre: 'Usuario',
      apellido: 'Prueba',
    }
    setUser(mockUser)
    localStorage.setItem('zas_user', JSON.stringify(mockUser))
    return { user: mockUser }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('zas_user')
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
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
