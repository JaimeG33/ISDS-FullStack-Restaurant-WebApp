import type { ReactNode } from 'react'
import { navigate } from '../lib/router'
import { useStore } from '../state/store'
import { Logo } from './ui'

export type StaffSection = 'orders' | 'sales' | 'menu' | 'inventory' | 'reports'

const links: { id: StaffSection; label: string; managerOnly: boolean }[] = [
  { id: 'orders', label: 'Active orders', managerOnly: false },
  { id: 'sales', label: 'Past sales', managerOnly: true },
  { id: 'menu', label: 'Menu', managerOnly: true },
  { id: 'inventory', label: 'Inventory', managerOnly: true },
  { id: 'reports', label: 'Reports', managerOnly: true },
]

/** Navy sidebar + main area shared by E2–E7. Cooks only see the order queue. */
export function StaffLayout({ active, children }: { active: StaffSection; children: ReactNode }) {
  const { staff, signOut } = useStore()
  const isManager = staff?.role === 'Manager'
  const allowed = links.find((l) => l.id === active)!
  const blocked = allowed.managerOnly && !isManager

  return (
    <div className="staff">
      <aside className="staff__sidebar">
        <a href="#/staff/orders" className="staff__logo">
          <Logo eyebrow="STAFF" dark />
        </a>
        <nav className="staff__nav" aria-label="Staff">
          {links
            .filter((l) => isManager || !l.managerOnly)
            .map((l) => (
              <a key={l.id} href={`#/staff/${l.id}`} aria-current={l.id === active ? 'page' : undefined}>
                {l.label}
              </a>
            ))}
        </nav>
        <span className="staff__spacer" />
        <div className="staff__user">
          <strong>{staff?.name}</strong>
          <span>
            {staff?.role} · {staff?.shift}
          </span>
          <button
            type="button"
            onClick={() => {
              signOut()
              navigate('/staff')
            }}
          >
            Sign out
          </button>
          <a href="#/" className="staff__customer-link">
            ← Customer site
          </a>
        </div>
      </aside>
      <main className="staff__main">
        {blocked ? (
          <div className="card empty">
            <p>Only managers can open {allowed.label.toLowerCase()}.</p>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  )
}

export function StaffHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="staff-header">
      <h1 className="display staff-header__title">{title}</h1>
      <span className="staff-header__spacer" />
      {children}
    </div>
  )
}
