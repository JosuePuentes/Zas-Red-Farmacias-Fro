import React, { createContext, useContext, useState, useCallback } from 'react'
import type { CarritoItem, Producto } from '../types'

interface CartContextType {
  items: CarritoItem[]
  addItem: (producto: Producto, cantidad: number, farmaciaId: string) => void
  removeItem: (productoId: string, farmaciaId: string) => void
  updateQuantity: (productoId: string, farmaciaId: string, cantidad: number) => void
  totalItems: number
  totalPrice: number
  openCart: boolean
  setOpenCart: (open: boolean) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

const STORAGE_KEY = 'zas_carrito'

function loadCart(): CarritoItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return []
}

function saveCart(items: CarritoItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch (_) {}
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CarritoItem[]>(loadCart)
  const [openCart, setOpenCart] = useState(false)

  const persist = useCallback((next: CarritoItem[]) => {
    setItems(next)
    saveCart(next)
  }, [])

  const addItem = useCallback((producto: Producto, cantidad: number, farmaciaId: string) => {
    if (cantidad < 1) return
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.producto.id === producto.id && i.farmaciaId === farmaciaId)
      const next = [...prev]
      if (idx >= 0) {
        next[idx] = { ...next[idx], cantidad: next[idx].cantidad + cantidad }
      } else {
        next.push({ producto, cantidad, farmaciaId })
      }
      saveCart(next)
      return next
    })
  }, [])

  const removeItem = useCallback((productoId: string, farmaciaId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => !(i.producto.id === productoId && i.farmaciaId === farmaciaId))
      saveCart(next)
      return next
    })
  }, [])

  const updateQuantity = useCallback((productoId: string, farmaciaId: string, cantidad: number) => {
    if (cantidad < 1) {
      removeItem(productoId, farmaciaId)
      return
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.producto.id === productoId && i.farmaciaId === farmaciaId ? { ...i, cantidad } : i
      )
      saveCart(next)
      return next
    })
  }, [removeItem])

  const clearCart = useCallback(() => {
    setItems([])
    saveCart([])
  }, [])

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0)
  const totalPrice = items.reduce((s, i) => s + (i.producto.precioConPorcentaje ?? i.producto.precio) * i.cantidad, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        totalItems,
        totalPrice,
        openCart,
        setOpenCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
