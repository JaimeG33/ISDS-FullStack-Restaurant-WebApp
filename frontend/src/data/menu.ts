// Synthetic menu data for UI prototyping (matches the Figma "Final Design — The Burger Lab").
// Replace with API calls to the backend (MENU_ITEM / RECIPE / RECIPE_RULE tables) later.
import classic from '../assets/photos/classic.jpg'
import bacon from '../assets/photos/bacon.jpg'
import veggie from '../assets/photos/veggie.jpg'
import fries from '../assets/photos/fries.jpg'
import soda from '../assets/photos/soda.jpg'
import shake from '../assets/photos/shake.jpg'

export type Category = 'Burgers' | 'Fries' | 'Drinks' | 'Milkshakes'

/** An ingredient that comes on the item and can be taken off for free. */
export interface Removable {
  id: string
  name: string
  amount: string // e.g. "1 leaf"
}

/** An ingredient the customer can add more of. */
export interface Extra {
  id: string
  name: string
  short: string // label used on tickets, e.g. "+1 patty"
  price: number // per unit
  seconds: number // extra prep time per unit
  max: number // most extra units allowed
}

export interface Size {
  id: 'S' | 'M' | 'L'
  name: string
  price: number
}

export interface MenuItem {
  id: string
  name: string
  shortName: string
  description: string
  category: Category
  price: number // base price (smallest size for sized items)
  prepSeconds: number
  tags: string[] // allergens / diet notes shown on the card
  allergens: string[]
  photo: string
  badge?: 'Popular'
  soldOut?: boolean
  removables?: Removable[]
  extras?: Extra[]
  sizes?: Size[]
}

const burgerExtras: Extra[] = [
  { id: 'patty', name: 'Beef patty', short: 'patty', price: 2, seconds: 30, max: 2 },
  { id: 'bacon', name: 'Bacon strip', short: 'bacon', price: 0.75, seconds: 10, max: 2 },
  { id: 'cheddar', name: 'Cheddar slice', short: 'cheddar', price: 0.5, seconds: 3, max: 2 },
]

export const menu: MenuItem[] = [
  {
    id: 'classic',
    name: 'Classic Cheeseburger',
    shortName: 'Classic Cheeseburger',
    description: 'Single patty, American cheese, pickles, house sauce',
    category: 'Burgers',
    price: 6.49,
    prepSeconds: 180,
    tags: ['Dairy · Gluten'],
    allergens: ['Dairy', 'Gluten'],
    photo: classic,
    removables: [
      { id: 'lettuce', name: 'Lettuce', amount: '1 leaf' },
      { id: 'pickles', name: 'Pickles', amount: '3 slices' },
      { id: 'onion', name: 'Onion', amount: '2 slices' },
      { id: 'sauce', name: 'House sauce', amount: '1 spread' },
    ],
    extras: burgerExtras,
  },
  {
    id: 'bacon',
    name: 'Bacon Deluxe Burger',
    shortName: 'Bacon Deluxe',
    description: 'Double patty, crispy bacon, cheddar, brioche bun',
    category: 'Burgers',
    price: 8.99,
    prepSeconds: 240,
    tags: ['Dairy · Gluten'],
    allergens: ['Dairy', 'Gluten', 'Sesame'],
    photo: bacon,
    badge: 'Popular',
    removables: [
      { id: 'lettuce', name: 'Lettuce', amount: '1 leaf' },
      { id: 'tomato', name: 'Tomato', amount: '2 slices' },
      { id: 'onion', name: 'Onion', amount: '2 slices' },
      { id: 'pickles', name: 'Pickles', amount: '2 slices' },
    ],
    extras: burgerExtras,
  },
  {
    id: 'veggie',
    name: 'Veggie Burger',
    shortName: 'Veggie Burger',
    description: 'Plant-based patty, avocado, lettuce, tomato, wheat bun',
    category: 'Burgers',
    price: 7.49,
    prepSeconds: 180,
    tags: ['Vegetarian'],
    allergens: ['Gluten', 'Soy'],
    photo: veggie,
    removables: [
      { id: 'avocado', name: 'Avocado', amount: '3 slices' },
      { id: 'lettuce', name: 'Lettuce', amount: '1 leaf' },
      { id: 'tomato', name: 'Tomato', amount: '2 slices' },
    ],
    extras: [{ id: 'cheddar', name: 'Cheddar slice', short: 'cheddar', price: 0.5, seconds: 3, max: 2 }],
  },
  {
    id: 'fries',
    name: 'Classic Fries',
    shortName: 'Classic Fries',
    description: 'Sea-salted and crispy. Small, medium or large',
    category: 'Fries',
    price: 2.99,
    prepSeconds: 120,
    tags: ['Vegan'],
    allergens: [],
    photo: fries,
    sizes: [
      { id: 'S', name: 'Small', price: 2.99 },
      { id: 'M', name: 'Medium', price: 3.49 },
      { id: 'L', name: 'Large', price: 3.99 },
    ],
  },
  {
    id: 'soda',
    name: 'Fountain Soda',
    shortName: 'Fountain Soda',
    description: 'Four flavors. Small, medium or large',
    category: 'Drinks',
    price: 1.99,
    prepSeconds: 0,
    tags: ['Free refills'],
    allergens: [],
    photo: soda,
    sizes: [
      { id: 'S', name: 'Small', price: 1.99 },
      { id: 'M', name: 'Medium', price: 2.49 },
      { id: 'L', name: 'Large', price: 2.99 },
    ],
  },
  {
    id: 'shake',
    name: 'Vanilla Milkshake',
    shortName: 'Vanilla Milkshake',
    description: 'Hand-spun vanilla, whipped cream, cherry',
    category: 'Milkshakes',
    price: 4.49,
    prepSeconds: 180,
    tags: ['Dairy'],
    allergens: ['Dairy'],
    photo: shake,
    soldOut: true,
  },
]

export const categories: Category[] = ['Burgers', 'Fries', 'Drinks', 'Milkshakes']

export const TAX_RATE = 0.09
/** Kitchen load multiplier applied to prep-time estimates ("Busy ×1.25"). */
export const BUSY_MULTIPLIER = 1.25

export const findItem = (id: string) => menu.find((m) => m.id === id)

export const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
export const money = (n: number) => currency.format(n)

/** Display text for prep time on a menu card, e.g. "~3 min" or "Instant". */
export const prepLabel = (seconds: number) => (seconds === 0 ? 'Instant' : `~${Math.round(seconds / 60)} min`)
