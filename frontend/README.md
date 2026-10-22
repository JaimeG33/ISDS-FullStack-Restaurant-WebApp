# Frontend

React + TypeScript + Vite. Run commands from the repository root:

```sh
npm install
npm run dev
```

## The Burger Lab screens (from the Figma "Final Design — The Burger Lab" page)

| Figma frame | Route | File |
| --- | --- | --- |
| C1 · Home | `#/` | `src/pages/Home.tsx` |
| C2 · Menu | `#/menu` | `src/pages/Menu.tsx` |
| C3 · Customize item (modal) | opens from Menu / Cart "Edit" | `src/components/CustomizeModal.tsx` |
| C4 · Cart | `#/cart` | `src/pages/Cart.tsx` |
| C5 · Checkout | `#/checkout` | `src/pages/Checkout.tsx` |
| C6 · Order status | `#/order/<number>` or `#/track` | `src/pages/OrderStatus.tsx` |
| E1 · Staff sign-in | `#/staff` | `src/pages/staff/SignIn.tsx` |
| E2/E3 · Active orders + order drawer | `#/staff/orders[/<number>]` | `src/pages/staff/ActiveOrders.tsx` |
| E4 · Past sales | `#/staff/sales` | `src/pages/staff/PastSales.tsx` |
| E5 · Menu management | `#/staff/menu` | `src/pages/staff/MenuManagement.tsx` |
| E6 · Inventory | `#/staff/inventory` | `src/pages/staff/Inventory.tsx` |
| E7 · Reports | `#/staff/reports` | `src/pages/staff/Reports.tsx` |

## How to test the full flow

1. Home → **Start your order** → add items (burgers open the customize modal; fries/soda ask for a size).
2. Cart → **Go to checkout** → fill the form. Payment is **simulated** — use `4242 4242 4242 4242`, any future date, any CVC. Nothing is charged or sent anywhere.
3. You land on the live order status page with a countdown.
4. Footer → **Staff sign-in** (demo logins: manager `E-1042` / PIN `1234`, cook `E-2077` / PIN `5678`).
   Your new order shows in the **New** column — press **Start** then **Mark ready** and the customer tracker updates.

Cooks only see Active orders; managers see every screen.

## Where things live

- `src/data/menu.ts` — menu items, prices, sizes, extras, prep times (sample data; swap for API calls later)
- `src/data/staff.ts` — sample kitchen tickets, sales, stock, reports, demo staff logins
- `src/lib/order.ts` — price / tax (9%) / prep-time math (busy multiplier ×1.25)
- `src/state/` — cart + orders state, saved in the browser's localStorage (no backend yet)
- `src/index.css` + `src/styles/` — design tokens (colors, fonts) and screen styles
- `src/assets/` — food photos and logo exported from Figma

All data is synthetic and stays in the browser. Card numbers are never stored (only the last four digits).
