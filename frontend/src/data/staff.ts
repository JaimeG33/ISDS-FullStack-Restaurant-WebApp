// Synthetic staff-side data (kitchen queue, sales, stock, reports) for UI prototyping.
// Every name, number and order here is made up. Replace with API calls later.
import type { CartLine } from '../lib/order'

export type KitchenStatus = 'new' | 'preparing' | 'ready' | 'picked'

export interface KitchenOrder {
  id: number
  placedAt: number // epoch ms
  readyAt?: number // when it was marked ready
  customer: string // "Guest · Sam" or "Jordan L."
  fullName: string
  phone: string
  status: KitchenStatus
  lines: Omit<CartLine, 'key'>[]
  total: number
  card: string // last four digits only
}

const min = 60_000

/** Seed tickets that match the Figma board. Times are relative to when the app loads. */
export function seedKitchenOrders(now = Date.now()): KitchenOrder[] {
  return [
    {
      id: 48293,
      placedAt: now - 45_000,
      customer: 'Guest · Sam',
      fullName: 'Sam',
      phone: '(555) 301-4410',
      status: 'new',
      lines: [
        { itemId: 'classic', qty: 1, removed: ['pickles'], extras: { cheddar: 1 } },
        { itemId: 'soda', qty: 1, removed: [], extras: {}, size: 'M' },
      ],
      total: 10.25,
      card: '4417',
    },
    {
      id: 48292,
      placedAt: now - 90_000,
      customer: 'Guest · Priya',
      fullName: 'Priya',
      phone: '(555) 778-1022',
      status: 'new',
      lines: [
        { itemId: 'veggie', qty: 2, removed: [], extras: {} },
        { itemId: 'fries', qty: 2, removed: [], extras: {}, size: 'S' },
      ],
      total: 22.85,
      card: '9921',
    },
    {
      id: 48290,
      placedAt: now - 12 * min - 10_000,
      customer: 'Guest · Alex',
      fullName: 'Alex',
      phone: '(555) 640-3381',
      status: 'preparing',
      lines: [
        { itemId: 'bacon', qty: 1, removed: ['onion'], extras: {} },
        { itemId: 'bacon', qty: 1, removed: [], extras: {} },
      ],
      total: 19.6,
      card: '0057',
    },
    {
      id: 48291,
      placedAt: now - 4 * min - 2_000,
      customer: 'Jordan L.',
      fullName: 'Jordan Lee',
      phone: '(555) 214-7788',
      status: 'preparing',
      lines: [
        { itemId: 'bacon', qty: 1, removed: ['onion'], extras: { patty: 1 } },
        { itemId: 'bacon', qty: 1, removed: ['pickles'], extras: {} },
        { itemId: 'fries', qty: 1, removed: [], extras: {}, size: 'L' },
        { itemId: 'soda', qty: 1, removed: [], extras: {}, size: 'M' },
      ],
      total: 28.84,
      card: '3456',
    },
    {
      id: 48285,
      placedAt: now - 15 * min,
      readyAt: now - 3 * min,
      customer: 'Guest · Chris',
      fullName: 'Chris',
      phone: '(555) 410-8890',
      status: 'ready',
      lines: [
        { itemId: 'veggie', qty: 3, removed: [], extras: {} },
        { itemId: 'soda', qty: 3, removed: [], extras: {}, size: 'L' },
      ],
      total: 34.27,
      card: '1180',
    },
  ]
}

/** Standard recipe per menu item: ingredient -> units used for ONE item (size L for sized items). */
export const recipes: Record<string, Record<string, number>> = {
  classic: { 'Sesame bun': 1, 'Beef patty': 1, 'American cheese': 1, 'Lettuce leaf': 1, 'Pickle slice': 3, 'Onion slice': 2 },
  bacon: {
    'Brioche bun': 1,
    'Beef patty': 2,
    'Bacon strip': 2,
    'Cheddar slice': 2,
    'Lettuce leaf': 1,
    'Tomato slice': 2,
    'Onion slice': 2,
    'Pickle slice': 2,
  },
  veggie: { 'Wheat bun': 1, 'Veggie patty': 1, 'Avocado slice': 3, 'Lettuce leaf': 1, 'Tomato slice': 2 },
  fries: { 'Fries portion': 1 },
  soda: { 'Soda cup': 1 },
  shake: { 'Milkshake base': 1 },
}

/** Which recipe ingredient a removable / extra id maps to. */
export const ingredientFor: Record<string, string> = {
  lettuce: 'Lettuce leaf',
  tomato: 'Tomato slice',
  onion: 'Onion slice',
  pickles: 'Pickle slice',
  avocado: 'Avocado slice',
  patty: 'Beef patty',
  bacon: 'Bacon strip',
  cheddar: 'Cheddar slice',
}

export interface Sale {
  id: number
  time: string
  customer: string
  items: string
  total: number
  payment: 'Paid' | 'Declined'
  day: 'today' | 'week'
}

export const pastSales: Sale[] = [
  { id: 48288, time: '6:24 PM', customer: 'Guest · Taylor', items: 'Classic Cheeseburger, Soda (M)', total: 9.25, payment: 'Paid', day: 'today' },
  { id: 48287, time: '6:19 PM', customer: 'Morgan K.', items: 'Bacon Deluxe (+bacon), Fries (M)', total: 14.17, payment: 'Paid', day: 'today' },
  { id: 48286, time: '6:11 PM', customer: 'Guest · Dee', items: 'Veggie Burger', total: 8.16, payment: 'Declined', day: 'today' },
  { id: 48284, time: '5:52 PM', customer: 'Guest · Jamie', items: 'Veggie Burger, Iced Tea', total: 9.78, payment: 'Paid', day: 'today' },
  { id: 48283, time: '5:41 PM', customer: 'Riley P.', items: '2× Classic Cheeseburger, 2× Fries (S)', total: 18.96, payment: 'Paid', day: 'today' },
  { id: 48282, time: '5:33 PM', customer: 'Guest · Ana', items: 'Bacon Deluxe, Milkshake', total: 13.48, payment: 'Paid', day: 'today' },
  { id: 48281, time: '5:20 PM', customer: 'Guest · Lee', items: '3× Classic Fries (M)', total: 10.47, payment: 'Paid', day: 'today' },
  { id: 48266, time: 'Tue 7:02 PM', customer: 'Guest · Omar', items: 'Bacon Deluxe (+1 patty), Soda (L)', total: 13.79, payment: 'Paid', day: 'week' },
  { id: 48241, time: 'Mon 12:18 PM', customer: 'Casey W.', items: '2× Veggie Burger', total: 16.33, payment: 'Paid', day: 'week' },
]

export interface StockRow {
  name: string
  onHand: number
  unit: string
  capacity: number // used to draw the level bar
  updated: string
  /** How many stock units one purchase unit gives, e.g. 1 whole tomato = 8 slices. */
  perPurchase: number
  purchaseUnit: string
}

export const stock: StockRow[] = [
  { name: 'Beef patty', onHand: 142, unit: 'patty', capacity: 200, updated: '6:31 PM', perPurchase: 20, purchaseUnit: 'box of 20' },
  { name: 'Bacon strip', onHand: 36, unit: 'strip', capacity: 120, updated: '6:31 PM', perPurchase: 12, purchaseUnit: 'pack of 12' },
  { name: 'Tomato slice', onHand: 80, unit: 'slice', capacity: 145, updated: '2:10 PM', perPurchase: 8, purchaseUnit: 'whole tomato' },
  { name: 'Onion slice', onHand: 0, unit: 'slice', capacity: 120, updated: '5:58 PM', perPurchase: 10, purchaseUnit: 'whole onion' },
  { name: 'Milkshake base', onHand: 2, unit: 'cup', capacity: 40, updated: '4:45 PM', perPurchase: 8, purchaseUnit: 'carton (8 cups)' },
  { name: 'Brioche bun', onHand: 96, unit: 'bun', capacity: 150, updated: '6:31 PM', perPurchase: 12, purchaseUnit: 'bag of 12' },
]

export interface Movement {
  time: string
  ingredient: string
  type: 'Order' | 'Correction' | 'Restock'
  change: number
  by: string
}

export const movements: Movement[] = [
  { time: '6:31 PM', ingredient: 'Beef patty', type: 'Order', change: -5, by: '#48291' },
  { time: '5:58 PM', ingredient: 'Onion slice', type: 'Correction', change: -6, by: 'Maya R. · dropped tray' },
  { time: '2:10 PM', ingredient: 'Tomato slice', type: 'Restock', change: 80, by: 'Devon T.' },
]

export interface RecipeRule {
  ingredient: string
  canAdd: boolean
  canRemove: boolean
  min: number
  max: number
  price: number
  secAdd: number
  secRemove: number
  on: boolean
}

export const baconRules: RecipeRule[] = [
  { ingredient: 'Beef patty', canAdd: true, canRemove: false, min: 2, max: 4, price: 2, secAdd: 30, secRemove: 0, on: true },
  { ingredient: 'Bacon strip', canAdd: true, canRemove: true, min: 0, max: 4, price: 0.75, secAdd: 10, secRemove: 0, on: true },
  { ingredient: 'Cheddar slice', canAdd: true, canRemove: true, min: 0, max: 4, price: 0.5, secAdd: 3, secRemove: 0, on: true },
  { ingredient: 'Onion slice', canAdd: false, canRemove: true, min: 0, max: 2, price: 0, secAdd: 0, secRemove: 0, on: true },
  { ingredient: 'Pickle slice', canAdd: true, canRemove: true, min: 0, max: 4, price: 0.25, secAdd: 2, secRemove: 0, on: true },
]

export const report = {
  periods: ['Today', 'Last 7 days', 'This month'] as const,
  kpis: [
    { label: 'Revenue', value: '$7,305', delta: '+8% vs last week', good: true },
    { label: 'Paid orders', value: '412', delta: '+5% vs last week', good: true },
    { label: 'Avg order', value: '$17.73', delta: '+3% vs last week', good: true },
    { label: 'Avg ready time', value: '9.2 min', delta: 'Target: under 10 min', good: false },
  ],
  revenueByDay: [
    { day: 'Thu', value: 730 },
    { day: 'Fri', value: 840 },
    { day: 'Sat', value: 780 },
    { day: 'Sun', value: 970 },
    { day: 'Mon', value: 1380 },
    { day: 'Tue', value: 1270 },
    { day: 'Wed', value: 1335 },
  ],
  bestSellers: [
    { name: 'Classic Cheese', count: 168 },
    { name: 'Bacon Deluxe', count: 133 },
    { name: 'Classic Fries', count: 122 },
    { name: 'Fountain Soda', count: 97 },
    { name: 'Veggie Burger', count: 61 },
  ],
  topChanges: [
    { name: 'No onion', count: 74 },
    { name: '+1 patty', count: 50 },
    { name: 'No pickles', count: 41 },
  ],
}

/** Demo staff accounts. A real app checks these on the server, never in the browser. */
export const demoStaff: Record<string, { name: string; role: 'Manager' | 'Cook'; pin: string; shift: string }> = {
  'E-1042': { name: 'Maya R.', role: 'Manager', pin: '1234', shift: 'shift ends 10 PM' },
  'E-2077': { name: 'Devon T.', role: 'Cook', pin: '5678', shift: 'shift ends 6 PM' },
}
