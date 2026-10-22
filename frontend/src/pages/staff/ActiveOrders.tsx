import { useState, type MouseEvent } from 'react'
import { StaffHeader, StaffLayout } from '../../components/StaffLayout'
import { Button, Pill, type Tone } from '../../components/ui'
import { BUSY_MULTIPLIER, findItem, money } from '../../data/menu'
import { ingredientFor, recipes, type KitchenOrder, type KitchenStatus } from '../../data/staff'
import { clock, mmss, modifiers, totals, unitSeconds } from '../../lib/order'
import { navigate } from '../../lib/router'
import { useNow, useStore } from '../../state/store'

const columns: { status: KitchenStatus; label: string; tone: Tone }[] = [
  { status: 'new', label: 'New', tone: 'blue' },
  { status: 'preparing', label: 'Preparing', tone: 'warn' },
  { status: 'ready', label: 'Ready for pickup', tone: 'ok' },
]

const estimateMs = (o: KitchenOrder) => totals(o.lines.map((l, i) => ({ ...l, key: String(i) }))).seconds * 1000

/** E2 · Active orders (kitchen queue) + E3 · Order detail drawer when an order id is in the URL. */
export function ActiveOrders({ openId }: { openId?: number }) {
  const { orders } = useStore()
  const now = useNow()
  const [query, setQuery] = useState('')
  const visible = orders.filter((o) => o.status !== 'picked' && String(o.id).includes(query.replace(/\D/g, '')))
  const open = openId ? orders.find((o) => o.id === openId) : undefined

  return (
    <StaffLayout active="orders">
      <StaffHeader title="Active orders">
        <span className="kitchen-load">
          <span className="muted">Kitchen load</span> <strong>Busy ×{BUSY_MULTIPLIER}</strong>
        </span>
        <input
          className="field__input search"
          placeholder="Search order #"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search order number"
        />
      </StaffHeader>

      <div className="board">
        {columns.map((col) => {
          const list = visible
            .filter((o) => o.status === col.status)
            .sort((a, b) => a.placedAt - b.placedAt)
          return (
            <section key={col.status} className="board__col" aria-label={col.label}>
              <div className="board__head">
                <Pill tone={col.tone}>{col.label}</Pill>
                <span className="count">{list.length}</span>
              </div>
              {list.map((o) => (
                <Ticket key={o.id} order={o} now={now} />
              ))}
              {list.length === 0 && <p className="muted small board__empty">Nothing here.</p>}
            </section>
          )
        })}
      </div>

      {open && <OrderDrawer order={open} />}
    </StaffLayout>
  )
}

function Ticket({ order, now }: { order: KitchenOrder; now: number }) {
  const { setOrderStatus } = useStore()
  const elapsed = (now - order.placedAt) / 1000
  const late = order.status !== 'ready' && now - order.placedAt > estimateMs(order)
  const act = (status: KitchenStatus) => (e: MouseEvent) => {
    e.stopPropagation()
    setOrderStatus(order.id, status)
  }

  return (
    <article
      className={`ticket card${late ? ' ticket--late' : ''}`}
      onClick={() => navigate(`/staff/orders/${order.id}`)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/staff/orders/${order.id}`)}
      aria-label={`Order ${order.id}`}
    >
      <div className="ticket__head mono">
        <strong>#{order.id}</strong>
        <span className={late ? 'bad' : 'muted'}>
          {order.status === 'ready' && order.readyAt
            ? `Ready ${Math.max(0, Math.round((now - order.readyAt) / 60000))} min`
            : `${mmss(elapsed)}${late ? ' · LATE' : ''}`}
        </span>
      </div>
      <TicketLines order={order} />
      <div className="ticket__foot">
        <span className="muted small">{order.customer}</span>
        {order.status === 'new' && (
          <Button size="sm" onClick={act('preparing')}>
            Start
          </Button>
        )}
        {order.status === 'preparing' && (
          <Button size="sm" onClick={act('ready')}>
            Mark ready
          </Button>
        )}
        {order.status === 'ready' && (
          <Button size="sm" variant="secondary" onClick={act('picked')}>
            Picked up
          </Button>
        )}
      </div>
    </article>
  )
}

function TicketLines({ order }: { order: KitchenOrder }) {
  return (
    <div className="ticket__lines">
      {order.lines.map((line, i) => {
        const item = findItem(line.itemId)
        return (
          <div key={i}>
            <p>
              <strong>{line.qty}×</strong> {item?.name}
              {line.size ? ` (${line.size})` : ''}
            </p>
            {modifiers(line).map((m) => (
              <p key={m.text} className={`mod mod--${m.kind}`}>
                {m.text.toUpperCase()}
              </p>
            ))}
          </div>
        )
      })}
    </div>
  )
}

/** Ingredient units this order takes out of stock (recipe × qty, minus removals, plus extras). */
function stockUsed(order: KitchenOrder) {
  const used: Record<string, number> = {}
  for (const line of order.lines) {
    const recipe = { ...(recipes[line.itemId] ?? {}) }
    for (const r of line.removed) delete recipe[ingredientFor[r]]
    for (const [x, n] of Object.entries(line.extras)) recipe[ingredientFor[x]] = (recipe[ingredientFor[x]] ?? 0) + n
    for (const [name, n] of Object.entries(recipe)) {
      const label = line.size ? `${name} (${line.size})` : name
      used[label] = (used[label] ?? 0) + n * line.qty
    }
  }
  return Object.entries(used).filter(([, n]) => n > 0)
}

function OrderDrawer({ order }: { order: KitchenOrder }) {
  const { setOrderStatus } = useStore()
  const [flagged, setFlagged] = useState(false)
  const close = () => navigate('/staff/orders')
  const base = order.lines.reduce((s, l) => s + unitSeconds(l) * l.qty, 0)
  const eta = order.placedAt + estimateMs(order)
  const pill: Record<KitchenStatus, [Tone, string]> = {
    new: ['blue', 'New'],
    preparing: ['warn', 'Preparing'],
    ready: ['ok', 'Ready'],
    picked: ['grey', 'Picked up'],
  }

  return (
    <div className="drawer-backdrop" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <aside className="drawer" role="dialog" aria-modal="true" aria-label={`Order ${order.id}`}>
        <div className="drawer__head">
          <div>
            <p className="eyebrow">Order</p>
            <p className="mono drawer__id">#{order.id}</p>
          </div>
          <div className="drawer__head-right">
            <Pill tone={pill[order.status][0]}>{pill[order.status][1]}</Pill>
            <button type="button" className="modal__close" onClick={close} aria-label="Close">
              ×
            </button>
          </div>
        </div>
        <div className="kv">
          <span>Customer</span>
          <strong>
            {order.fullName} · {order.phone}
          </strong>
        </div>
        <div className="kv">
          <span>Placed</span>
          <strong>Today {clock(order.placedAt)}</strong>
        </div>
        <div className="kv">
          <span>Payment</span>
          <span className="kv__pay">
            <Pill tone="ok">Approved</Pill>
            <strong>{money(order.total)}</strong>
          </span>
        </div>
        <hr className="divider" />

        <div className="stack-10">
          <p className="eyebrow">Items</p>
          <TicketLines order={order} />
        </div>

        <div className="stack-8">
          <p className="eyebrow">Prep-time estimate</p>
          <div className="math">
            {order.lines.map((l, i) => {
              const item = findItem(l.itemId)!
              return (
                <div key={i} className="math__row">
                  <span>
                    {item.shortName}
                    {l.size ? ` (${l.size})` : ''} ×{l.qty}
                  </span>
                  <span>{unitSeconds(l) * l.qty} s</span>
                </div>
              )
            })}
            <div className="math__row">
              <span>Base total</span>
              <span>{base} s</span>
            </div>
            <div className="math__row">
              <span>Busy multiplier</span>
              <span>×{BUSY_MULTIPLIER}</span>
            </div>
            <div className="math__row math__row--total">
              <span>Estimated ready</span>
              <span className="blue">{clock(eta)}</span>
            </div>
          </div>
        </div>

        <div className="stack-8">
          <p className="eyebrow">Stock used by this order</p>
          <div className="math">
            {stockUsed(order).map(([name, n]) => (
              <div key={name} className="math__row">
                <span>{name}</span>
                <span>−{n}</span>
              </div>
            ))}
          </div>
        </div>

        {flagged && <p className="info-box small">Flagged. The manager on shift sees this on their queue (simulated).</p>}

        <div className="drawer__actions">
          {order.status === 'new' && (
            <Button block onClick={() => setOrderStatus(order.id, 'preparing')}>
              Start
            </Button>
          )}
          {order.status === 'preparing' && (
            <Button block onClick={() => setOrderStatus(order.id, 'ready')}>
              Mark ready
            </Button>
          )}
          {order.status === 'ready' && (
            <Button
              block
              onClick={() => {
                setOrderStatus(order.id, 'picked')
                close()
              }}
            >
              Picked up
            </Button>
          )}
          <Button variant="secondary" onClick={() => setFlagged(true)} disabled={flagged}>
            Flag missing item
          </Button>
        </div>
      </aside>
    </div>
  )
}
