import { useState, type FormEvent } from 'react'
import { Button, Field, Logo } from '../../components/ui'
import { demoStaff } from '../../data/staff'
import { navigate } from '../../lib/router'
import { useStore } from '../../state/store'

/** E1 · Staff sign-in — reads EMPLOYEE; role decides which screens show. */
export function SignIn() {
  const { signIn } = useStore()
  const [id, setId] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const key = id.trim().toUpperCase()
    const user = demoStaff[key]
    // Prototype only: a real app checks the PIN on the server, never in the browser.
    if (!user || user.pin !== pin) {
      setError("That employee ID and PIN don't match.")
      return
    }
    signIn({ id: key, name: user.name, role: user.role, shift: user.shift })
    navigate('/staff/orders')
  }

  return (
    <div className="signin">
      <section className="signin__brand">
        <Logo eyebrow="STAFF" dark />
        <div className="stack-14">
          <h1 className="display signin__title">Kitchen, menu and stock in one place.</h1>
          <p className="signin__lead">
            Sign in with your employee ID. Cooks see the order queue. Managers also see the menu, inventory and reports.
          </p>
        </div>
        <p className="signin__help">Need help? Ask a manager to reset your PIN.</p>
      </section>
      <form className="signin__form" onSubmit={submit}>
        <h2 className="display page-title page-title--30">Staff sign-in</h2>
        <Field label="Employee ID" mono value={id} onChange={(e) => setId(e.target.value)} placeholder="E-1042" autoComplete="username" />
        <Field
          label="PIN"
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
          placeholder="••••"
          autoComplete="current-password"
          error={error || undefined}
        />
        <Button type="submit" block>
          Sign in
        </Button>
        <p className="muted small">Forgot your PIN? Ask a manager to reset it.</p>
        <p className="info-box small">
          <strong>Demo logins:</strong> Manager <span className="mono">E-1042</span> / PIN <span className="mono">1234</span> ·
          Cook <span className="mono">E-2077</span> / PIN <span className="mono">5678</span>
        </p>
        <a href="#/" className="text-btn">
          ← Back to the customer site
        </a>
      </form>
    </div>
  )
}
