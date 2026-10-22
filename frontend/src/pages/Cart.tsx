import { NavBar, SiteFooter } from '../components/NavBar'
import { Chip, LinkButton, Stepper } from '../components/ui'
import { TAX_RATE, findItem, money } from '../data/menu'
import { lineTitle, linePrice, minutes, modifiers, totals } from '../lib/order'
import { useStore } from '../state/store'

/** C4 · Cart — UC 2.1 step 6. Lines stay in the browser until checkout. */
export function Cart() {
  const { cart, setQty, removeLine, openCustomize } = useStore()
  const t = totals(cart)

  return (
    <div className="page">
      <NavBar active="cart" />
      <main className="section two-col">
        <div className="two-col__main stack-14">
          <h1 className="display page-title">Your order</h1>
          {cart.length === 0 ? (
            <div className="card empty">
              <p>Your cart is empty.</p>
              <LinkButton href="#/menu">Browse the menu</LinkButton>
            </div>
          ) : (
            <>
              <ul className="card lines">
                {cart.map((line) => {
                  const item = findItem(line.itemId)!
                  const mods = modifiers(line)
                  return (
                    <li key={line.key} className="cart-line">
                      <img src={item.photo} alt="" className="thumb thumb--72" />
                      <div className="cart-line__info">
                        <strong>{lineTitle(line)}</strong>
                        <div className="chips">
                          {mods.length ? (
                            mods.map((m) => (
                              <Chip key={m.text} tone={m.kind}>
                                {m.text}
                              </Chip>
                            ))
                          ) : (
                            <Chip tone="remove">No changes</Chip>
                          )}
                        </div>
                        <div className="cart-line__actions">
                          <button type="button" className="text-btn" onClick={() => openCustomize(line.itemId, line.key)}>
                            Edit
                          </button>
                          <button type="button" className="text-btn text-btn--bad" onClick={() => removeLine(line.key)}>
                            Remove
                          </button>
                        </div>
                      </div>
                      <Stepper label={item.name} value={line.qty} min={1} max={20} onChange={(n) => setQty(line.key, n)} />
                      <strong className="cart-line__price">{money(linePrice(line))}</strong>
                    </li>
                  )
                })}
              </ul>
              <p className="muted small">Two burgers made differently show up as two separate lines.</p>
            </>
          )}
        </div>

        <aside className="card summary">
          <h2 className="display summary__title">Summary</h2>
          <div className="sum-row">
            <span>Subtotal</span>
            <span>{money(t.subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Tax ({Math.round(TAX_RATE * 100)}%)</span>
            <span>{money(t.tax)}</span>
          </div>
          <hr className="divider" />
          <div className="sum-row sum-row--total">
            <span>Total</span>
            <span>{money(t.total)}</span>
          </div>
          {cart.length > 0 && <p className="ready-note">Ready about {minutes(t.seconds)} min after you pay.</p>}
          {cart.length > 0 ? (
            <LinkButton href="#/checkout">Go to checkout</LinkButton>
          ) : (
            <button type="button" className="btn btn--primary btn--md" disabled>
              Go to checkout
            </button>
          )}
          <LinkButton href="#/menu" variant="secondary">
            Keep browsing
          </LinkButton>
        </aside>
      </main>
      <SiteFooter />
    </div>
  )
}
