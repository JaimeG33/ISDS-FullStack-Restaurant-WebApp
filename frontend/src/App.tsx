import { useEffect } from 'react'
import { CustomizeModal } from './components/CustomizeModal'
import { navigate, useRoute } from './lib/router'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Home } from './pages/Home'
import { Menu } from './pages/Menu'
import { OrderStatus } from './pages/OrderStatus'
import { ActiveOrders } from './pages/staff/ActiveOrders'
import { Inventory } from './pages/staff/Inventory'
import { MenuManagement } from './pages/staff/MenuManagement'
import { PastSales } from './pages/staff/PastSales'
import { Reports } from './pages/staff/Reports'
import { SignIn } from './pages/staff/SignIn'
import { useStore } from './state/store'

/**
 * Screens (Figma frame → route):
 *  C1 Home #/ · C2 Menu #/menu · C3 Customize (modal) · C4 Cart #/cart · C5 Checkout #/checkout
 *  C6 Order status #/order/:id (or #/track) · E1 Staff sign-in #/staff · E2/E3 Active orders #/staff/orders[/:id]
 *  E4 Past sales #/staff/sales · E5 Menu #/staff/menu · E6 Inventory #/staff/inventory · E7 Reports #/staff/reports
 */
function App() {
  const path = useRoute()
  const { staff } = useStore()
  const isStaffArea = path.startsWith('/staff/')

  useEffect(() => {
    if (isStaffArea && !staff) navigate('/staff')
  }, [isStaffArea, staff])

  const screen = (() => {
    if (path === '/menu') return <Menu />
    if (path === '/cart') return <Cart />
    if (path === '/checkout') return <Checkout />
    if (path === '/track') return <OrderStatus />
    const order = /^\/order\/(\d+)$/.exec(path)
    if (order) return <OrderStatus orderId={Number(order[1])} />

    if (path === '/staff') return <SignIn />
    if (isStaffArea && !staff) return null
    const ticket = /^\/staff\/orders(?:\/(\d+))?$/.exec(path)
    if (ticket) return <ActiveOrders openId={ticket[1] ? Number(ticket[1]) : undefined} />
    if (path === '/staff/sales') return <PastSales />
    if (path === '/staff/menu') return <MenuManagement />
    if (path === '/staff/inventory') return <Inventory />
    if (path === '/staff/reports') return <Reports />
    return <Home />
  })()

  return (
    <>
      {screen}
      <CustomizeModal />
    </>
  )
}

export default App
