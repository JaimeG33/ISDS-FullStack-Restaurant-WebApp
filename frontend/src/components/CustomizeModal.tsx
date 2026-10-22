import { useEffect, useRef, useState } from 'react'
import { findItem, money, type MenuItem } from '../data/menu'
import { unitPrice, unitSeconds, type CartLine } from '../lib/order'
import { useStore } from '../state/store'
import { Button, Stepper, Toggle } from './ui'

/** C3 · Customize item (modal). Also used for picking a size on fries / drinks, and for "Edit" in the cart. */
export function CustomizeModal() {
  const { customize, closeCustomize, cart } = useStore()
  if (!customize) return null
  const item = findItem(customize.itemId)
  if (!item) return null
  const existing = customize.lineKey ? cart.find((l) => l.key === customize.lineKey) : undefined
  // key forces a fresh form each time the modal opens for a different item/line
  return <ModalBody key={`${item.id}-${customize.lineKey ?? 'new'}`} item={item} existing={existing} onClose={closeCustomize} />
}

function ModalBody({ item, existing, onClose }: { item: MenuItem; existing?: CartLine; onClose: () => void }) {
  const { addLine, replaceLine } = useStore()
  const [removed, setRemoved] = useState<string[]>(existing?.removed ?? [])
  const [extras, setExtras] = useState<Record<string, number>>(existing?.extras ?? {})
  const [size, setSize] = useState<CartLine['size']>(existing?.size ?? (item.sizes ? 'M' : undefined))
  const [qty, setQty] = useState(existing?.qty ?? 1)
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const line = { itemId: item.id, removed, extras, size }
  const each = unitPrice(line)
  const seconds = unitSeconds(line)

  const toggleRemoved = (id: string, on: boolean) =>
    setRemoved((r) => (on ? r.filter((x) => x !== id) : [...r, id]))

  const save = () => {
    if (existing) replaceLine(existing.key, line, qty)
    else addLine(line, qty)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1} ref={dialogRef}>
        <aside className="modal__item">
          <img className="modal__photo" src={item.photo} alt={item.name} />
          {item.allergens.length > 0 && (
            <div className="stack-8">
              <p className="eyebrow">Allergens</p>
              <div className="chips">
                {item.allergens.map((a) => (
                  <span key={a} className="allergen">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="math math--white" aria-label="Prep time">
            <div className="math__row">
              <span>Base prep</span>
              <span>{item.prepSeconds} s</span>
            </div>
            {item.extras?.map((x) =>
              extras[x.id] ? (
                <div className="math__row" key={x.id}>
                  <span>
                    +{extras[x.id]} extra {x.short}
                  </span>
                  <span>+{extras[x.id] * x.seconds} s</span>
                </div>
              ) : null,
            )}
            {item.removables?.map((r) =>
              removed.includes(r.id) ? (
                <div className="math__row" key={r.id}>
                  <span>No {r.name.toLowerCase()}</span>
                  <span>+0 s</span>
                </div>
              ) : null,
            )}
            <hr />
            <div className="math__row math__row--total">
              <span>This item</span>
              <span>{seconds === 0 ? 'Instant' : `~${Math.round((seconds / 60) * 2) / 2} min`}</span>
            </div>
          </div>
        </aside>

        <div className="modal__options">
          <div className="modal__head">
            <div>
              <h2 id="modal-title" className="display modal__title">
                {item.name}
              </h2>
              <p className="muted">{item.description}</p>
            </div>
            <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          {item.sizes && (
            <section className="stack-8">
              <div className="option-head">
                <p className="eyebrow">Size</p>
              </div>
              <div className="size-grid" role="radiogroup" aria-label="Size">
                {item.sizes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    role="radio"
                    aria-checked={size === s.id}
                    className="option option--size"
                    onClick={() => setSize(s.id)}
                  >
                    <strong>{s.name}</strong>
                    <span className="muted">{money(s.price)}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {item.removables && (
            <section className="stack-8">
              <div className="option-head">
                <p className="eyebrow">What's on it</p>
                <span>Tap to remove</span>
              </div>
              {item.removables.map((r) => {
                const on = !removed.includes(r.id)
                return (
                  <div key={r.id} className={`option${on ? '' : ' option--off'}`}>
                    <div className="option__text">
                      <strong>{r.name}</strong>
                      <span>{on ? r.amount : 'Removed · no charge'}</span>
                    </div>
                    <Toggle on={on} onChange={(v) => toggleRemoved(r.id, v)} label={r.name} />
                  </div>
                )
              })}
            </section>
          )}

          {item.extras && (
            <section className="stack-8">
              <div className="option-head">
                <p className="eyebrow">Add extra</p>
                <span>Up to {item.extras[0].max} more</span>
              </div>
              {item.extras.map((x) => (
                <div key={x.id} className="option">
                  <div className="option__text">
                    <strong>{x.name}</strong>
                    <span>
                      +{money(x.price)} each · +{x.seconds} s
                    </span>
                  </div>
                  <Stepper
                    label={x.name}
                    value={extras[x.id] ?? 0}
                    max={x.max}
                    onChange={(n) => setExtras((e) => ({ ...e, [x.id]: n }))}
                  />
                </div>
              ))}
            </section>
          )}

          <div className="modal__footer">
            <Stepper label="items" value={qty} min={1} max={20} onChange={setQty} />
            <Button block onClick={save}>
              {existing ? 'Update item' : 'Add to cart'} · {money(each * qty)}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
