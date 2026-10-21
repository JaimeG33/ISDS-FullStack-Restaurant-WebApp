import { menu } from './data/menu'
import './App.css'

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })

function App() {
  return (
    <main>
      <header>
        <p className="eyebrow">ISDS 454 · Restaurant ordering</p>
        <h1>Something good is on the menu.</h1>
        <p>A starter menu for your restaurant UI prototype.</p>
      </header>
      <section aria-labelledby="menu-title">
        <h2 id="menu-title">Our menu</h2>
        <div className="menu-grid">
          {menu.map((item) => (
            <article key={item.id}>
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <strong>{currency.format(item.price)}</strong>
            </article>
          ))}
        </div>
      </section>
      <footer>Sample menu · Ordering is not enabled yet.</footer>
    </main>
  )
}

export default App
