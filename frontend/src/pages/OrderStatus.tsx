import { useState, type FormEvent } from 'react'
import { NavBar, SiteFooter } from '../components/NavBar'
import { Button, Chip, Field, Pill } from '../components/ui'
import { findItem, money } from '../data/menu'
import { clock, lineTitle, linePrice, mmss, modifiers, totals } from '../lib/order'
import { navigate } from '../lib/router'
import { useNow, useStore } from '../state/store'

type StageState = 'done' | 'current' | 'todo'

/** C6 · Order confirmed + live status — UC 2.2 step 8, UC 2.3, UC 2.4. */
export function OrderStatus({ orderId }: { orderId?: number }) {
  const { orders } = useStore()
  const order = orderId ? orders.find((o) => o.id === orderId) : undefined
  if (!order) return <TrackLookup notFound={orderId !== undefined} />
  return <StatusView id={order.id} />
}

function StatusView({ id }: { id: number }) {
  const { orders } = useStore()
  const now = useNow()
  const order = orders.find((o) => o.id === id)!
  const t = totals(order.lines.map((l, i) => ({ ...l, key: String(i) })))
  const eta = order.placedAt + t.seconds * 1000
  const left = Math.max(0, (eta - now) / 1000)
  const isReady = order.status === 'ready' || order.status === 'picked'
  const assembling = order.status === 'preparing' && now - order.placedAt > t.seconds * 1000 * 0.6

  const stages: { name: string; sub: string; state: StageState }[] = [
    { name: 'Received', sub: clock(order.placedAt), state: 'done' },
    {
      name: 'Preparing',
      sub: order.status === 'new' ? 'Waiting for the grill' : 'Grill is on it',
      state: order.status === 'new' ? 'todo' : assembling || isReady ? 'done' : 'current',
    },
    { name: 'Assembling', sub: assembling ? 'Wrapping it up' : 'Up next', state: isReady ? 'done' : assembling ? 'current' : 'todo' },
    { name: 'Ready', sub: isReady ? 'At the counter' : `~${clock(eta)}`, state: isReady ? 'done' : 'todo' },
  ]
  const first = order.fullName.split(/\s+/)[0]

  return (
    <div className="page">
      <NavBar active="status" />
      <main className="section two-col">
        <div className="two-col__main stack-20">
          <div className="stack-10">
            <Pill tone="ok">Payment approved</Pill>
            <h1 className="display page-title">
              Thanks, {first}! Order #{order.id} is in.
            </h1>
            <p className="muted">Show this number at the pickup counter.</p>
          </div>

          <ol className="card tracker" aria-label="Order progress">
            {stages.map((s, i) => (
              <li key={s.name} className={`tracker__stage tracker__stage--${s.state}`}>
                {i > 0 && <span className={`tracker__bar${s.state !== 'todo' ? ' tracker__bar--done' : ''}`} aria-hidden="true" />}
                <span className="tracker__dot" aria-hidden="true">
                  {s.state === 'done' ? '✓' : ''}
                </span>
                <strong>{s.name}</strong>
                <span className="muted small">{s.sub}</span>
              </li>
            ))}
          </ol>

          <ul className="card lines">
            {order.lines.map((line, i) => {
              const item = findItem(line.itemId)!
              const mods = modifiers(line)
              return (
                <li key={i} className="cart-line cart-line--compact">
                  <img src={item.photo} alt="" className="thumb thumb--56" />
                  <div className="cart-line__info">
                    <strong>
                      {line.qty > 1 ? `${line.qty}× ` : ''}
                      {lineTitle(line)}
                    </strong>
                    {mods.length > 0 && (
                      <div className="chips">
                        {mods.map((m) => (
                          <Chip key={m.text} tone={m.kind}>
                            {m.text}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                  <strong className="cart-line__price">{money(linePrice({ ...line, key: '' }))}</strong>
                </li>
              )
            })}
          </ul>
          <p className="muted small">
            Testing tip: sign in on the <a href="#/staff" className="link">staff side</a> and press Start / Mark ready on this
            order to watch the tracker move.
          </p>
        </div>

        <aside className="stack-14 side-340">
          <div className="countdown">
            <p className="countdown__label">{isReady ? 'YOUR ORDER IS' : 'READY IN ABOUT'}</p>
            <p className="display countdown__time" aria-live="polite">
              {isReady ? 'Ready!' : mmss(left)}
            </p>
            <p className="countdown__sub">{isReady ? 'Head to the pickup counter.' : `Estimated pickup ${clock(eta)}`}</p>
          </div>
          <div className="card receipt">
            <p className="eyebrow">Receipt</p>
            <div className="sum-row">
              <span>Subtotal</span>
              <span>{money(t.subtotal)}</span>
            </div>
            <div className="sum-row">
              <span>Tax</span>
              <span>{money(t.tax)}</span>
            </div>
            <div className="sum-row sum-row--total">
              <span>Paid</span>
              <span>{money(t.total)}</span>
            </div>
            <div className="sum-row">
              <span>Card</span>
              <span>•••• {order.card}</span>
            </div>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </div>
  )
}

function TrackLookup({ notFound }: { notFound: boolean }) {
  const [value, setValue] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const n = parseInt(value.replace(/\D/g, ''), 10)
    if (n) navigate(`/order/${n}`)
  }
  return (
    <div className="page">
      <NavBar active="status" />
      <main className="section narrow">
        <form className="card track-card stack-14" onSubmit={submit}>
          <h1 className="display page-title">Track an order</h1>
          <p className="muted">Enter the order number from your confirmation (try 48291).</p>
          {notFound && <p className="field__error">We couldn't find that order number.</p>}
          <Field label="Order number" mono value={value} onChange={(e) => setValue(e.target.value)} placeholder="#48291" />
          <Button type="submit">Find my order</Button>
        </form>
      </main>
      <SiteFooter />
    </div>
  )
}
