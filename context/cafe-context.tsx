"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

interface User {
  id: number
  email: string
  name: string
  role: string
  beanBalance: number
  createdAt: string
  updatedAt: string
}

interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  notes?: string
  customizations?: {
    size?: string
    milk?: string
    extras?: string[]
  }
}

interface Cart {
  items: CartItem[]
}
type OrderType = "dine-in" | "takeout" | null
interface CafeContextType {
  user: User | null
  setUser: (user: User | null) => void
  token: string | null
  setToken: (token: string | null) => void
  cart: Cart
  addToCart: (item: CartItem) => void
  updateCartItemQuantity: (item: CartItem, quantity: number) => void
  removeFromCart: (item: CartItem) => void
  clearCart: () => void
  logout: () => void
  orderType: OrderType
  setOrderType: (type: OrderType) => void
  tableNumber: number | null
  setTableNumber: (table: number | null) => void
}

const CafeContext = createContext<CafeContextType | undefined>(undefined)

export function CafeProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [cart, setCart] = useState<Cart>({ items: [] })

  const [orderType, setOrderType] = useState<OrderType>(null)
  const [tableNumber, setTableNumber] = useState<number | null>(null)

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // Check if item with same customizations already exists
      const existingItemIndex = prevCart.items.findIndex(
        (i) => i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations),
      )

      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedItems = [...prevCart.items]
        updatedItems[existingItemIndex].quantity += item.quantity
        return { ...prevCart, items: updatedItems }
      } else {
        // Add new item
        return { ...prevCart, items: [...prevCart.items, item] }
      }
    })
  }

  const updateCartItemQuantity = (item: CartItem, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(item)
      return
    }

    setCart((prevCart) => {
      const updatedItems = prevCart.items.map((i) => {
        if (i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)) {
          return { ...i, quantity }
        }
        return i
      })

      return { ...prevCart, items: updatedItems }
    })
  }

  const removeFromCart = (item: CartItem) => {
    setCart((prevCart) => {
      const updatedItems = prevCart.items.filter(
        (i) => !(i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)),
      )

      return { ...prevCart, items: updatedItems }
    })
  }

  const clearCart = () => {
    setCart({ items: [] })
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearCart()
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return (
    <CafeContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        logout,
        orderType,
        setOrderType,
        tableNumber,
        setTableNumber,
      }}
    >
      {children}
    </CafeContext.Provider>
  )
}

export function useCafe() {
  const context = useContext(CafeContext)
  if (context === undefined) {
    throw new Error("useCafe must be used within a CafeProvider")
  }
  return context
}
