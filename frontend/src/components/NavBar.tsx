import { useStore } from '../state/store'
import { Logo } from './ui'

type Section = 'home' | 'menu' | 'status' | 'cart'

/** Customer top bar. On checkout it shows the Cart → Checkout → Confirmation steps instead of links. */
export function NavBar({ active, steps }: { active?: Section; steps?: 'checkout' }) {
  const { cartCount, lastOrderId } = useStore()

  return (
    <header className="navbar">
      <a href="#/" aria-label="The Burger Lab home">
        <Logo />
      </a>
      <span className="navbar__spacer" />
      {steps === 'checkout' ? (
        <ol className="crumbs" aria-label="Checkout steps">
          <li>
            <a href="#/cart">Cart</a>
          </li>
          <li aria-hidden="true">→</li>
          <li aria-current="step">
            <strong>Checkout</strong>
          </li>
          <li aria-hidden="true">→</li>
          <li>Confirmation</li>
        </ol>
      ) : (
        <nav className="navbar__links" aria-label="Main">
          <a href="#/" className="navlink" aria-current={active === 'home' ? 'page' : undefined}>
            Home
          </a>
          <a href="#/menu" className="navlink" aria-current={active === 'menu' ? 'page' : undefined}>
            Menu
          </a>
          <a
            href={lastOrderId ? `#/order/${lastOrderId}` : '#/track'}
            className="navlink"
            aria-current={active === 'status' ? 'page' : undefined}
          >
            Order status
          </a>
          <a href="#/cart" className="cart-btn" aria-label={`Cart, ${cartCount} items`}>
            Cart <span className="cart-btn__count">{cartCount}</span>
          </a>
        </nav>
      )}
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <span>The Burger Lab · ISDS 454 prototype · orders and payments are simulated</span>
      <a href="#/staff">Staff sign-in →</a>
    </footer>
  )
}
