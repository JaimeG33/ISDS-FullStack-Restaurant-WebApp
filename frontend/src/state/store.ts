// App-wide state shape + hooks. The provider lives in StoreProvider.tsx.
// Everything is kept in the browser (localStorage) — there is no backend yet.
import { createContext, useContext, useEffect, useState } from 'react'
import type { CartLine } from '../lib/order'
import type { KitchenOrder, KitchenStatus } from '../data/staff'

export type LineInput = Omit<CartLine, 'key' | 'qty'>

export interface StaffUser {
  id: string
  name: string
  role: 'Manager' | 'Cook'
  shift: string
}

export interface Store {
  cart: CartLine[]
  cartCount: number
  orders: KitchenOrder[]
  lastOrderId: number | null
  staff: StaffUser | null
  customize: { itemId: string; lineKey?: string } | null

  addLine: (line: LineInput, qty: number) => void
  replaceLine: (key: string, line: LineInput, qty: number) => void
  setQty: (key: string, qty: number) => void
  removeLine: (key: string) => void
  placeOrder: (contact: { name: string; phone: string; card: string }) => number
  setOrderStatus: (id: number, status: KitchenStatus) => void
  signIn: (user: StaffUser) => void
  signOut: () => void
  openCustomize: (itemId: string, lineKey?: string) => void
  closeCustomize: () => void
  resetDemo: () => void
}

export const StoreContext = createContext<Store | null>(null)

export function useStore() {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside <StoreProvider>')
  return store
}

/** Re-render every `ms` so timers and countdowns stay live. Returns the current time. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms)
    return () => window.clearInterval(id)
  }, [ms])
  return now
}
