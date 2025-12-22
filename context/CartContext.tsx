import { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import type { CatalogCartItem, CatalogProduct } from '../types'

interface CartContextValue {
  cart: CatalogCartItem[]
  addToCart: (product: CatalogProduct) => void
  removeFromCart: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CatalogCartItem[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const saved = typeof window !== 'undefined' ? localStorage.getItem('renewablezmart_cart') : null
    if (saved) setCart(JSON.parse(saved))
  }, [])

  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem('renewablezmart_cart', JSON.stringify(cart))
    }
  }, [cart, isClient])

  function addToCart(product: CatalogProduct) {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id)
      if (existing) return prev.map((p) => (p.id === product.id ? { ...p, qty: p.qty + 1 } : p))
      return [...prev, { ...product, qty: 1 }]
    })
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((p) => p.id !== id))
  }

  function updateQty(id: string, qty: number) {
    if (qty <= 0) return removeFromCart(id)
    setCart((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)))
  }

  function clearCart() {
    setCart([])
  }

  return <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
