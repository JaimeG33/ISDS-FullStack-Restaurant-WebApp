import { useState } from 'react'
import { StaffHeader, StaffLayout } from '../../components/StaffLayout'
import { Button, Pill, type Tone } from '../../components/ui'
import { movements as seedMovements, stock as seedStock, type Movement, type StockRow } from '../../data/staff'
import { clock } from '../../lib/order'
import { useStore } from '../../state/store'

const level = (r: StockRow) => r.onHand / r.capacity
const levelTone = (r: StockRow) => (r.onHand === 0 || level(r) < 0.1 ? 'bad' : level(r) < 0.35 ? 'warn' : 'ok')
const typeTone: Record<Movement['type'], Tone> = { Order: 'blue', Correction: 'warn', Restock: 'ok' }

/** E6 · Inventory — stock levels, record a restock or correction, recent movements. */
export function Inventory() {
  const { staff } = useStore()
  const [rows, setRows] = useState(seedStock)
  const [moves, setMoves] = useState(seedMovements)
  const [mode, setMode] = useState<'restock' | 'correction'>('restock')
  const [name, setName] = useState('Tomato slice')
  const [amount, setAmount] = useState('10')
  const [reason, setReason] = useState('')
  const [query, setQuery] = useState('')

  const row = rows.find((r) => r.name === name)!
  const n = Number(amount) || 0
  const change = mode === 'restock' ? n * row.perPurchase : n
  const newBalance = Math.max(0, row.onHand + change)
  const lowCount = rows.filter((r) => levelTone(r) === 'bad').length
  const shown = rows.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))

  const save = () => {
    if (!change) return
    const time = clock(Date.now())
    setRows((rs) => rs.map((r) => (r.name === name ? { ...r, onHand: newBalance, updated: time } : r)))
    setMoves((ms) => [
      {
        time,
        ingredient: name,
        type: mode === 'restock' ? 'Restock' : 'Correction',
        change: newBalance - row.onHand,
        by: `${staff?.name ?? 'Staff'}${mode === 'correction' && reason ? ` · ${reason}` : ''}`,
      },
      ...ms,
    ])
    setReason('')
  }

  return (
    <StaffLayout active="inventory">
      <StaffHeader title="Inventory">
        {lowCount > 0 && <Pill tone="bad">{lowCount} low or out</Pill>}
        <input
          className="field__input search search--220"
          placeholder="Search ingredient"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search ingredient"
        />
      </StaffHeader>

      <div className="inv">
        <div className="card table-wrap inv__table">
          <table className="table">
            <thead>
              <tr>
                <th>Ingredient</th>
                <th className="num">On hand</th>
                <th>Unit</th>
                <th>Level</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const tone = levelTone(r)
                return (
                  <tr key={r.name}>
                    <td className="strong">{r.name}</td>
                    <td className="num">{r.onHand}</td>
                    <td>{r.unit}</td>
                    <td>
                      <span className="level">
                        <span className="level__bar">
                          <span
                            className={`level__fill level__fill--${tone}`}
                            style={{ width: `${Math.max(4, Math.min(100, level(r) * 100))}%` }}
                          />
                        </span>
                        {tone === 'bad' && <Pill tone="bad">{r.onHand === 0 ? 'Out' : 'Low'}</Pill>}
                      </span>
                    </td>
                    <td>{r.updated}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <section className="card pad-20 stack-14 inv__form">
          <h2 className="display h-18">Record a {mode}</h2>
          <div className="segmented segmented--ice" role="group" aria-label="Movement type">
            <button type="button" aria-pressed={mode === 'restock'} onClick={() => setMode('restock')}>
              Restock
            </button>
            <button type="button" aria-pressed={mode === 'correction'} onClick={() => setMode('correction')}>
              Correction
            </button>
          </div>
          <label className="field">
            <span className="field__label">Ingredient</span>
            <select className="field__input" value={name} onChange={(e) => setName(e.target.value)}>
              {rows.map((r) => (
                <option key={r.name}>{r.name}</option>
              ))}
            </select>
          </label>
          <div className="row-12">
            <label className="field">
              <span className="field__label">{mode === 'restock' ? 'Received' : `Change (${row.unit}s, use − to remove)`}</span>
              <input className="field__input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ''))} />
            </label>
            {mode === 'restock' ? (
              <label className="field">
                <span className="field__label">Purchase unit</span>
                <input className="field__input" value={row.purchaseUnit} readOnly />
              </label>
            ) : (
              <label className="field">
                <span className="field__label">Reason</span>
                <input className="field__input" value={reason} placeholder="dropped tray" onChange={(e) => setReason(e.target.value)} />
              </label>
            )}
          </div>
          <div className="math">
            {mode === 'restock' && (
              <div className="math__row">
                <span>
                  {n} × {row.perPurchase} {row.unit}s
                </span>
                <span>+{change}</span>
              </div>
            )}
            <div className="math__row">
              <span>Current</span>
              <span>{row.onHand}</span>
            </div>
            <hr />
            <div className="math__row math__row--total">
              <span>New balance</span>
              <span className="blue">
                {newBalance} {row.unit}s
              </span>
            </div>
          </div>
          <Button block onClick={save} disabled={!change}>
            Save {mode}
          </Button>
        </section>
      </div>

      <section className="card">
        <h2 className="display h-17 pad-rules">Recent stock movements</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Ingredient</th>
                <th>Type</th>
                <th className="num">Change</th>
                <th>By / order</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((m, i) => (
                <tr key={i}>
                  <td>{m.time}</td>
                  <td>{m.ingredient}</td>
                  <td>
                    <Pill tone={typeTone[m.type]}>{m.type}</Pill>
                  </td>
                  <td className={`num strong ${m.change < 0 ? 'bad' : 'ok'}`}>{m.change < 0 ? `−${-m.change}` : `+${m.change}`}</td>
                  <td className={m.by.startsWith('#') ? 'mono strong' : undefined}>{m.by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </StaffLayout>
  )
}
