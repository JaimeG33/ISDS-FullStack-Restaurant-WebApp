import { useState } from 'react'
import { NavBar, SiteFooter } from '../components/NavBar'
import { Pill } from '../components/ui'
import { categories, menu, money, prepLabel, type Category } from '../data/menu'
import { useStore } from '../state/store'

/** C2 · Menu — UC 2.1 steps 1 & 5. Tapping + opens the customize modal (C3). */
export function Menu() {
  const { openCustomize } = useStore()
  const [filter, setFilter] = useState<Category | 'All'>('All')
  const items = filter === 'All' ? menu : menu.filter((m) => m.category === filter)

  return (
    <div className="page">
      <NavBar active="menu" />
      <main className="section menu-page">
        <div className="section__head">
          <h1 className="display page-title page-title--lg">Menu</h1>
          <div className="filters" role="group" aria-label="Filter by category">
            {(['All', ...categories] as const).map((c) => (
              <button key={c} type="button" className="filter" aria-pressed={filter === c} onClick={() => setFilter(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="menu-grid">
          {items.map((item) => (
            <article key={item.id} className={`menu-card card${item.soldOut ? ' menu-card--sold-out' : ''}`}>
              <div className="menu-card__photo">
                <img src={item.photo} alt={item.name} />
                {item.badge && <Pill tone="blue">{item.badge}</Pill>}
                {item.soldOut && <Pill tone="grey">Sold out today</Pill>}
              </div>
              <div className="menu-card__body">
                <h2 className="display menu-card__name">{item.name}</h2>
                <p className="menu-card__desc">{item.description}</p>
                <p className="menu-card__meta">
                  <span>{prepLabel(item.prepSeconds)}</span>
                  {item.tags.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </p>
                <div className="menu-card__foot">
                  <span className="display menu-card__price">
                    {money(item.price)}
                    {item.sizes ? '+' : ''}
                  </span>
                  <button
                    type="button"
                    className="add-btn"
                    disabled={item.soldOut}
                    onClick={() => openCustomize(item.id)}
                    aria-label={item.soldOut ? `${item.name} is sold out` : `Add ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
