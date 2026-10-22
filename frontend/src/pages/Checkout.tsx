import { useState, type FormEvent } from 'react'
import { NavBar, SiteFooter } from '../components/NavBar'
import { Button, Field, LinkButton } from '../components/ui'
import { money } from '../data/menu'
import { linePrice, recapLabel, totals } from '../lib/order'
import { navigate } from '../lib/router'
import { useStore } from '../state/store'

interface Form {
  name: string
  phone: string
  card: string
  exp: string
  cvc: string
  zip: string
}

const digits = (s: string) => s.replace(/\D/g, '')

function validate(f: Form): Partial<Record<keyof Form, string>> {
  const e: Partial<Record<keyof Form, string>> = {}
  if (f.name.trim().length < 2) e.name = 'Enter the name for pickup.'
  if (digits(f.phone).length !== 10) e.phone = 'Enter a 10-digit phone number.'
  if (digits(f.card).length < 15 || digits(f.card).length > 16) e.card = 'Enter a 15–16 digit card number.'
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(f.exp)
  if (!m || +m[1] < 1 || +m[1] > 12) e.exp = 'Use MM / YY.'
  else {
    const now = new Date()
    const yy = now.getFullYear() % 100
    if (+m[2] < yy || (+m[2] === yy && +m[1] < now.getMonth() + 1)) e.exp = 'This card has expired.'
  }
  if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = '3 or 4 digits.'
  if (!/^\d{5}$/.test(f.zip)) e.zip = '5 digits.'
  return e
}

const formatPhone = (v: string) => {
  const d = digits(v).slice(0, 10)
  if (d.length < 4) return d
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}
const formatCard = (v: string) => digits(v).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
const formatExp = (v: string) => {
  const d = digits(v).slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)} / ${d.slice(2)}` : d
}

/** C5 · Checkout — UC 2.2 steps 2–5. Payment is SIMULATED: nothing is charged or sent anywhere. */
export function Checkout() {
  const { cart, placeOrder } = useStore()
  const [mode, setMode] = useState<'guest' | 'signin'>('guest')
  const [form, setForm] = useState<Form>({ name: '', phone: '', card: '', exp: '', cvc: '', zip: '' })
  const [touched, setTouched] = useState(false)
  const [paying, setPaying] = useState(false)
  const t = totals(cart)
  const errors = validate(form)
  const show = (k: keyof Form) => (touched ? errors[k] : undefined)

  const set = (k: keyof Form, fmt?: (v: string) => string) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: fmt ? fmt(e.target.value) : e.target.value }))

  const pay = (e: FormEvent) => {
    e.preventDefault()
    setTouched(true)
    if (Object.keys(errors).length || cart.length === 0) return
    setPaying(true)
    // Pretend to talk to the payment provider, then create the order.
    window.setTimeout(() => {
      const id = placeOrder({ name: form.name, phone: form.phone, card: form.card })
      navigate(`/order/${id}`)
    }, 900)
  }

  if (cart.length === 0) {
    return (
      <div className="page">
        <NavBar steps="checkout" />
        <main className="section">
          <div className="card empty">
            <p>Your cart is empty, so there is nothing to pay for yet.</p>
            <LinkButton href="#/menu">Browse the menu</LinkButton>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="page">
      <NavBar steps="checkout" />
      <form className="section two-col two-col--checkout" onSubmit={pay} noValidate>
        <div className="two-col__main stack-22">
          <h1 className="display page-title">Checkout</h1>
          <div className="segmented" role="group" aria-label="Guest or sign in">
            <button type="button" aria-pressed={mode === 'guest'} onClick={() => setMode('guest')}>
              Continue as guest
            </button>
            <button type="button" aria-pressed={mode === 'signin'} onClick={() => setMode('signin')}>
              Sign in
            </button>
          </div>
          {mode === 'signin' && (
            <p className="info-box">Customer accounts aren't built yet in this prototype — continue as a guest for now.</p>
          )}

          <fieldset className="stack-12">
            <legend className="eyebrow">Pickup contact</legend>
            <div className="row-14">
              <Field label="Full name" autoComplete="name" value={form.name} onChange={set('name')} error={show('name')} placeholder="Jordan Lee" />
              <Field
                label="Phone number"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={set('phone', formatPhone)}
                error={show('phone')}
                placeholder="(555) 214-7788"
              />
            </div>
            <p className="muted small">We'll text you when your order is ready.</p>
          </fieldset>

          <fieldset className="stack-12">
            <legend className="eyebrow">Payment</legend>
            <Field
              label="Card number"
              inputMode="numeric"
              autoComplete="off"
              value={form.card}
              onChange={set('card', formatCard)}
              error={show('card')}
              placeholder="1234 5678 9012 3456"
            />
            <div className="row-14">
              <Field label="Expiration" inputMode="numeric" autoComplete="off" value={form.exp} onChange={set('exp', formatExp)} error={show('exp')} placeholder="MM / YY" />
              <Field
                label="Security code"
                inputMode="numeric"
                autoComplete="off"
                value={form.cvc}
                onChange={set('cvc', (v) => digits(v).slice(0, 4))}
                error={show('cvc')}
                placeholder="CVC"
              />
              <Field label="ZIP code" inputMode="numeric" autoComplete="postal-code" value={form.zip} onChange={set('zip', (v) => digits(v).slice(0, 5))} error={show('zip')} placeholder="ZIP" />
            </div>
            <p className="info-box">
              Card details go straight to the payment provider. The Burger Lab only saves the result and a reference number,
              never your card number.
              <br />
              <strong>Prototype:</strong> payment is simulated. Don't enter a real card — use 4242 4242 4242 4242, any future date, any CVC.
            </p>
          </fieldset>
        </div>

        <aside className="card summary">
          <h2 className="display summary__title">Order recap</h2>
          {cart.map((l) => (
            <div key={l.key} className="recap-row">
              <span>{recapLabel(l)}</span>
              <span>{money(linePrice(l))}</span>
            </div>
          ))}
          <hr className="divider" />
          <div className="sum-row">
            <span>Subtotal</span>
            <span>{money(t.subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Tax</span>
            <span>{money(t.tax)}</span>
          </div>
          <div className="sum-row sum-row--total">
            <span>Total</span>
            <span>{money(t.total)}</span>
          </div>
          <Button type="submit" block disabled={paying}>
            {paying ? 'Processing…' : `Pay ${money(t.total)}`}
          </Button>
          {touched && Object.keys(errors).length > 0 && (
            <p className="field__error" role="alert">
              Check the highlighted fields.
            </p>
          )}
          <p className="demo-note">Prices are rechecked when you tap Pay.</p>
        </aside>
      </form>
      <SiteFooter />
    </div>
  )
}
