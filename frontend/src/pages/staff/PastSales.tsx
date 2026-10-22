import { useState } from 'react'
import { StaffHeader, StaffLayout } from '../../components/StaffLayout'
import { Pill } from '../../components/ui'
import { findItem, money } from '../../data/menu'
import { pastSales, type Sale } from '../../data/staff'
import { clock } from '../../lib/order'
import { navigate } from '../../lib/router'
import { useStore } from '../../state/store'

type Range = 'today' | 'week' | 'custom'

/** E4 · Past sales. Orders placed in this browser session show up at the top. */
export function PastSales() {
  const { orders } = useStore()
  const [range, setRange] = useState<Range>('today')
  const [query, setQuery] = useState('')

  // Orders customers placed during this demo session (id above the seeded ones) count as today's sales.
  const live: Sale[] = orders
    .filter((o) => o.id > 48293)
    .map((o) => ({
      id: o.id,
      time: clock(o.placedAt),
      customer: o.customer,
      items: o.lines
        .map((l) => `${l.qty > 1 ? `${l.qty}× ` : ''}${findItem(l.itemId)?.shortName}${l.size ? ` (${l.size})` : ''}`)
        .join(', '),
      total: o.total,
      payment: 'Paid',
      day: 'today',
    }))
  const all = [...live.reverse(), ...pastSales]
  const q = query.trim().toLowerCase()
  const rows = all
    .filter((s) => range !== 'today' || s.day === 'today')
    .filter((s) => !q || String(s.id).includes(q.replace('#', '')) || s.customer.toLowerCase().includes(q))

  return (
    <StaffLayout active="sales">
      <StaffHeader title="Past sales">
        <div className="filters" role="group" aria-label="Date range">
          {(
            [
              ['today', 'Today'],
              ['week', 'This week'],
              ['custom', 'Custom range'],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" className="filter filter--sm" aria-pressed={range === id} onClick={() => setRange(id)}>
              {label}
            </button>
          ))}
        </div>
        <input
          className="field__input search"
          placeholder="Search order # or name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search order number or name"
        />
      </StaffHeader>

      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Time</th>
              <th>Customer</th>
              <th>Items</th>
              <th className="num">Total</th>
              <th>Payment</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => {
              const open = orders.some((o) => o.id === s.id)
              return (
                <tr key={s.id} className={open ? 'clickable' : undefined} onClick={() => open && navigate(`/staff/orders/${s.id}`)}>
                  <td className="mono strong">#{s.id}</td>
                  <td>{s.time}</td>
                  <td>{s.customer}</td>
                  <td className="wrap">{s.items}</td>
                  <td className="num">{money(s.total)}</td>
                  <td>
                    <Pill tone={s.payment === 'Paid' ? 'ok' : 'bad'}>{s.payment}</Pill>
                  </td>
                </tr>
              )
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  No sales match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="muted small">
        Prices shown are what the customer paid at the time, even if menu prices changed later. Click a row to open the order.
      </p>
    </StaffLayout>
  )
}
