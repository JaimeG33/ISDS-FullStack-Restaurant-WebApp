// Small reusable building blocks from the Figma design (Logo, Pill, Stepper, Toggle, Button, Field).
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import logoMark from '../assets/logo-mark.svg'

export function Logo({ eyebrow = 'THE', dark = false }: { eyebrow?: string; dark?: boolean }) {
  return (
    <span className={`logo${dark ? ' logo--dark' : ''}`}>
      <img src={logoMark} alt="" width={34} height={34} />
      <span className="logo__stack">
        <span className="logo__eyebrow">{eyebrow}</span>
        <span className="logo__name">Burger Lab</span>
      </span>
    </span>
  )
}

export type Tone = 'ok' | 'blue' | 'warn' | 'bad' | 'grey'

export function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span className={`pill pill--${tone}`}>
      <span className="pill__dot" aria-hidden="true" />
      {children}
    </span>
  )
}

export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
  label: string
}) {
  return (
    <span className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label}`}>
        −
      </button>
      <span className="stepper__value" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label}`}>
        +
      </button>
    </span>
  )
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (on: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={`toggle${on ? ' toggle--on' : ''}`}
      onClick={() => onChange(!on)}
    >
      <span className="toggle__knob" />
    </button>
  )
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary'
  size?: 'md' | 'sm'
  block?: boolean
}

export function Button({ variant = 'primary', size = 'md', block, className = '', ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={`btn btn--${variant} btn--${size}${block ? ' btn--block' : ''} ${className}`.trim()}
      {...rest}
    />
  )
}

export function LinkButton({
  href,
  variant = 'primary',
  children,
}: {
  href: string
  variant?: 'primary' | 'secondary'
  children: ReactNode
}) {
  return (
    <a className={`btn btn--${variant} btn--md`} href={href}>
      {children}
    </a>
  )
}

export function Field({
  label,
  error,
  mono,
  ...input
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; mono?: boolean }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      <input className={`field__input${mono ? ' field__input--mono' : ''}${error ? ' field__input--error' : ''}`} {...input} />
      {error && <span className="field__error">{error}</span>}
    </label>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>
}

export function Chip({ tone, children }: { tone: 'add' | 'remove'; children: ReactNode }) {
  return <span className={`chip chip--${tone}`}>{children}</span>
}
