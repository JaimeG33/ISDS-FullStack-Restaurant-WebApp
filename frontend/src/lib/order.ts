// Pure helpers for pricing, prep time and labels. No React here so these are easy to test
// and to move to the backend later (the server should recheck prices when the customer pays).
import { BUSY_MULTIPLIER, TAX_RATE, findItem, type MenuItem } from '../data/menu'

/** One line in the cart. Two burgers made differently are two separate lines. */
export interface CartLine {
  key: string
  itemId: string
  qty: number
  removed: string[] // ids of removables taken off
  extras: Record<string, number> // extra id -> how many extra units
  size?: 'S' | 'M' | 'L'
}

export interface Modifier {
  text: string
  kind: 'add' | 'remove'
}

const round2 = (n: number) => Math.round(n * 100) / 100

export function basePrice(item: MenuItem, size?: CartLine['size']) {
  if (item.sizes && size) return item.sizes.find((s) => s.id === size)?.price ?? item.price
  return item.price
}

/** Price of one unit of this line (base + extras). */
export function unitPrice(line: Omit<CartLine, 'key' | 'qty'>) {
  const item = findItem(line.itemId)
  if (!item) return 0
  let price = basePrice(item, line.size)
  for (const extra of item.extras ?? []) price += (line.extras[extra.id] ?? 0) * extra.price
  return round2(price)
}

export const linePrice = (line: CartLine) => round2(unitPrice(line) * line.qty)

/** Prep seconds for ONE unit of this line (before the busy multiplier). */
export function unitSeconds(line: Omit<CartLine, 'key' | 'qty'>) {
  const item = findItem(line.itemId)
  if (!item) return 0
  let seconds = item.prepSeconds
  for (const extra of item.extras ?? []) seconds += (line.extras[extra.id] ?? 0) * extra.seconds
  return seconds
}

export function modifiers(line: Omit<CartLine, 'key' | 'qty'>): Modifier[] {
  const item = findItem(line.itemId)
  if (!item) return []
  const mods: Modifier[] = []
  for (const extra of item.extras ?? []) {
    const n = line.extras[extra.id] ?? 0
    if (n > 0) mods.push({ kind: 'add', text: `+${n} ${extra.short}` })
  }
  for (const r of item.removables ?? []) {
    if (line.removed.includes(r.id)) mods.push({ kind: 'remove', text: `No ${r.name.toLowerCase()}` })
  }
  return mods
}

const sizeName = (item: MenuItem, size?: CartLine['size']) => item.sizes?.find((s) => s.id === size)?.name

/** "Classic Fries · Large" */
export function lineTitle(line: Omit<CartLine, 'key' | 'qty'>) {
  const item = findItem(line.itemId)
  if (!item) return 'Unknown item'
  const size = sizeName(item, line.size)
  return size ? `${item.name} · ${size}` : item.name
}

/** "1× Bacon Deluxe (+1 patty, no onion)" — compact recap / kitchen text. */
export function recapLabel(line: CartLine) {
  const item = findItem(line.itemId)
  if (!item) return ''
  const mods = modifiers(line).map((m) => m.text.replace(/^No /, 'no '))
  const name = line.size ? `${item.shortName} (${line.size})` : item.shortName
  return `${line.qty}× ${name}${mods.length ? ` (${mods.join(', ')})` : ''}`
}

export interface Totals {
  subtotal: number
  tax: number
  total: number
  seconds: number // estimated time until ready, busy multiplier included
}

export function totals(lines: CartLine[]): Totals {
  const subtotal = round2(lines.reduce((sum, l) => sum + linePrice(l), 0))
  const tax = round2(subtotal * TAX_RATE)
  const base = lines.reduce((sum, l) => sum + unitSeconds(l) * l.qty, 0)
  return { subtotal, tax, total: round2(subtotal + tax), seconds: Math.round(base * BUSY_MULTIPLIER) }
}

/** Same item + same changes = same line, so adding it again just bumps the quantity. */
export function signature(line: Omit<CartLine, 'key' | 'qty'>) {
  const extras = Object.entries(line.extras)
    .filter(([, n]) => n > 0)
    .sort()
    .map(([k, n]) => `${k}${n}`)
  return [line.itemId, line.size ?? '', [...line.removed].sort().join('.'), extras.join('.')].join('|')
}

export const minutes = (seconds: number) => Math.max(1, Math.round(seconds / 60))

export const clock = (ms: number) =>
  new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

/** 625 -> "10:25" */
export function mmss(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
