import { useState } from 'react'
import { StaffHeader, StaffLayout } from '../../components/StaffLayout'
import { Button, Toggle } from '../../components/ui'
import { menu, money, type MenuItem } from '../../data/menu'
import { baconRules, recipes, type RecipeRule } from '../../data/staff'

/** Simple rules for items that don't have hand-written ones (derived from removables / extras). */
function rulesFor(item: MenuItem): RecipeRule[] {
  if (item.id === 'bacon') return baconRules
  const rows: RecipeRule[] = (item.extras ?? []).map((x) => ({
    ingredient: x.name,
    canAdd: true,
    canRemove: false,
    min: 0,
    max: x.max,
    price: x.price,
    secAdd: x.seconds,
    secRemove: 0,
    on: true,
  }))
  for (const r of item.removables ?? []) {
    rows.push({ ingredient: r.name, canAdd: false, canRemove: true, min: 0, max: 1, price: 0, secAdd: 0, secRemove: 0, on: true })
  }
  return rows
}

interface Draft {
  active: boolean
  price: string
  category: string
  prep: string
  rules: RecipeRule[]
}

const draftFor = (item: MenuItem): Draft => ({
  active: !item.soldOut,
  price: money(item.price),
  category: item.category,
  prep: `${item.prepSeconds} seconds`,
  rules: rulesFor(item).map((r) => ({ ...r })),
})

/** E5 · Menu management — item details, standard recipe and allowed changes (RECIPE_RULE). */
export function MenuManagement() {
  const [selected, setSelected] = useState('bacon')
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() => Object.fromEntries(menu.map((m) => [m.id, draftFor(m)])))
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const item = menu.find((m) => m.id === selected)!
  const d = drafts[selected]

  const update = (patch: Partial<Draft>) => {
    setSavedAt(null)
    setDrafts((all) => ({ ...all, [selected]: { ...all[selected], ...patch } }))
  }
  const updateRule = (i: number, patch: Partial<RecipeRule>) =>
    update({ rules: d.rules.map((r, j) => (j === i ? { ...r, ...patch } : r)) })

  return (
    <StaffLayout active="menu">
      <StaffHeader title="Menu">
        <Button size="sm" onClick={() => setSavedAt('Adding new items needs the backend (MENU_ITEM table) — coming later.')}>
          + New item
        </Button>
      </StaffHeader>

      <div className="mm">
        <ul className="card mm__list">
          {menu.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                className={`mm__item${m.id === selected ? ' mm__item--on' : ''}${drafts[m.id].active ? '' : ' mm__item--inactive'}`}
                onClick={() => setSelected(m.id)}
                aria-pressed={m.id === selected}
              >
                <img src={m.photo} alt="" className="thumb thumb--40" />
                <span className="mm__item-text">
                  <strong>{m.name}</strong>
                  <span className="muted">
                    {money(m.price)}
                    {m.sizes ? '+' : ''} · {drafts[m.id].active ? 'Active' : 'Inactive'}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <div className="stack-14 mm__editor">
          <section className="card pad-20 stack-16">
            <div className="row-between">
              <h2 className="display h-20">{item.name}</h2>
              <label className="row-8 strong">
                {d.active ? 'Active' : 'Inactive'}
                <Toggle on={d.active} onChange={(v) => update({ active: v })} label="Active on the menu" />
              </label>
            </div>
            <div className="row-14">
              <label className="field">
                <span className="field__label">Base price</span>
                <input className="field__input" value={d.price} onChange={(e) => update({ price: e.target.value })} />
              </label>
              <label className="field">
                <span className="field__label">Category</span>
                <select className="field__input" value={d.category} onChange={(e) => update({ category: e.target.value })}>
                  {['Burgers', 'Fries', 'Drinks', 'Milkshakes'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Base prep time</span>
                <input className="field__input" value={d.prep} onChange={(e) => update({ prep: e.target.value })} />
              </label>
            </div>
          </section>

          <section className="card pad-20 stack-12">
            <div className="row-between">
              <h3 className="display h-17">Standard recipe</h3>
              <button type="button" className="text-btn">
                + Add ingredient
              </button>
            </div>
            <div className="chips chips--8">
              {Object.entries(recipes[item.id] ?? {}).map(([name, n]) => (
                <span key={name} className="recipe-chip">
                  {name} ×{n}
                </span>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="row-between pad-rules">
              <h3 className="display h-17">Allowed changes</h3>
              <button type="button" className="text-btn">
                + Add rule
              </button>
            </div>
            <div className="table-wrap">
              <table className="table table--rules">
                <thead>
                  <tr>
                    <th>Ingredient</th>
                    <th>Can add</th>
                    <th>Can remove</th>
                    <th>Min–max</th>
                    <th className="num">+$ / unit</th>
                    <th className="num">+sec add</th>
                    <th className="num">+sec remove</th>
                    <th>On</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rules.map((r, i) => (
                    <tr key={r.ingredient}>
                      <td>{r.ingredient}</td>
                      <td>
                        <input type="checkbox" className="check" checked={r.canAdd} onChange={(e) => updateRule(i, { canAdd: e.target.checked })} aria-label={`${r.ingredient} can be added`} />
                      </td>
                      <td>
                        <input type="checkbox" className="check" checked={r.canRemove} onChange={(e) => updateRule(i, { canRemove: e.target.checked })} aria-label={`${r.ingredient} can be removed`} />
                      </td>
                      <td>
                        {r.min}–{r.max}
                      </td>
                      <td className="num">{money(r.price)}</td>
                      <td className="num">{r.secAdd}</td>
                      <td className="num">{r.secRemove}</td>
                      <td>
                        <Toggle on={r.on} onChange={(v) => updateRule(i, { on: v })} label={`${r.ingredient} rule on`} />
                      </td>
                    </tr>
                  ))}
                  {d.rules.length === 0 && (
                    <tr>
                      <td colSpan={8} className="muted">
                        No changes allowed for this item.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="row-end">
            {savedAt && <span className="muted small">{savedAt}</span>}
            <Button
              variant="secondary"
              onClick={() => {
                setDrafts((all) => ({ ...all, [selected]: draftFor(item) }))
                setSavedAt(null)
              }}
            >
              Cancel
            </Button>
            <Button onClick={() => setSavedAt('Saved in this browser only — the backend will store it later.')}>Save changes</Button>
          </div>
        </div>
      </div>
    </StaffLayout>
  )
}
