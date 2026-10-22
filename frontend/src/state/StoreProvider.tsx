import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { signature, totals, type CartLine } from '../lib/order'
import { seedKitchenOrders, type KitchenOrder, type KitchenStatus } from '../data/staff'
import { StoreContext, type LineInput, type StaffUser, type Store } from './store'

const STORAGE_KEY = 'burger-lab-demo-v1'

interface Saved {
  cart: CartLine[]
  orders: KitchenOrder[]
  lastOrderId: number | null
  staff: StaffUser | null
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Saved) : null
  } catch {
    return null
  }
}

const fresh = (): Saved => ({ cart: [], orders: seedKitchenOrders(), lastOrderId: null, staff: null })

let keyCounter = 0
const newKey = () => `line-${Date.now().toString(36)}-${keyCounter++}`

export function StoreProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<Saved>(() => load() ?? fresh())
  const [customize, setCustomize] = useState<Store['customize']>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      // Private mode or storage blocked: the demo still works, it just won't survive a refresh.
    }
  }, [saved])

  const setCart = useCallback((fn: (cart: CartLine[]) => CartLine[]) => {
    setSaved((s) => ({ ...s, cart: fn(s.cart) }))
  }, [])

  const addLine = useCallback(
    (line: LineInput, qty: number) =>
      setCart((cart) => {
        const sig = signature(line)
        const match = cart.find((l) => signature(l) === sig)
        if (match) return cart.map((l) => (l === match ? { ...l, qty: l.qty + qty } : l))
        return [...cart, { ...line, qty, key: newKey() }]
      }),
    [setCart],
  )

  const replaceLine = useCallback(
    (key: string, line: LineInput, qty: number) =>
      setCart((cart) => cart.map((l) => (l.key === key ? { ...line, qty, key } : l))),
    [setCart],
  )

  const setQty = useCallback(
    (key: string, qty: number) =>
      setCart((cart) =>
        qty <= 0 ? cart.filter((l) => l.key !== key) : cart.map((l) => (l.key === key ? { ...l, qty } : l)),
      ),
    [setCart],
  )

  const removeLine = useCallback((key: string) => setCart((cart) => cart.filter((l) => l.key !== key)), [setCart])

  const placeOrder = useCallback(
    (contact: { name: string; phone: string; card: string }) => {
      const id = Math.max(48293, ...saved.orders.map((o) => o.id)) + 1
      const order: KitchenOrder = {
        id,
        placedAt: Date.now(),
        customer: `Guest · ${contact.name.trim().split(/\s+/)[0]}`,
        fullName: contact.name.trim(),
        phone: contact.phone,
        status: 'new',
        lines: saved.cart.map(({ itemId, qty, removed, extras, size }) => ({ itemId, qty, removed, extras, size })),
        total: totals(saved.cart).total,
        card: contact.card.replace(/\D/g, '').slice(-4),
      }
      setSaved((s) => ({ ...s, cart: [], orders: [...s.orders, order], lastOrderId: id }))
      return id
    },
    [saved],
  )

  const setOrderStatus = useCallback((id: number, status: KitchenStatus) => {
    setSaved((s) => ({
      ...s,
      orders: s.orders.map((o) =>
        o.id === id ? { ...o, status, readyAt: status === 'ready' ? Date.now() : o.readyAt } : o,
      ),
    }))
  }, [])

  const store = useMemo<Store>(
    () => ({
      ...saved,
      cartCount: saved.cart.reduce((n, l) => n + l.qty, 0),
      customize,
      addLine,
      replaceLine,
      setQty,
      removeLine,
      placeOrder,
      setOrderStatus,
      signIn: (user) => setSaved((s) => ({ ...s, staff: user })),
      signOut: () => setSaved((s) => ({ ...s, staff: null })),
      openCustomize: (itemId, lineKey) => setCustomize({ itemId, lineKey }),
      closeCustomize: () => setCustomize(null),
      resetDemo: () => setSaved(fresh()),
    }),
    [saved, customize, addLine, replaceLine, setQty, removeLine, placeOrder, setOrderStatus],
  )

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}
