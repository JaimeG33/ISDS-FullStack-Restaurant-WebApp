import heroBacon from '../assets/photos/hero-bacon.png'
import { NavBar, SiteFooter } from '../components/NavBar'
import { LinkButton, Pill } from '../components/ui'
import { findItem, money } from '../data/menu'
import { useStore } from '../state/store'

const favorites = ['classic', 'fries', 'shake']

/** C1 · Home — entry point, guest-first. */
export function Home() {
  const { lastOrderId, openCustomize } = useStore()
  return (
    <div className="page">
      <NavBar active="home" />
      <section className="hero">
        <div className="hero__text">
          <Pill tone="ok">Open now · 11am – 10pm</Pill>
          <h1 className="display hero__title">Burgers built your way, ready when you are.</h1>
          <p className="hero__lead">
            Add, remove or double anything on the menu. You see your price and pickup time before you pay.
          </p>
          <div className="hero__actions">
            <LinkButton href="#/menu">Start your order</LinkButton>
            <LinkButton href={lastOrderId ? `#/order/${lastOrderId}` : '#/track'} variant="secondary">
              Track an order
            </LinkButton>
          </div>
        </div>
        <div className="hero__photo">
          <img src={heroBacon} alt="Bacon Deluxe Burger" width={360} height={360} />
        </div>
      </section>

      <dl className="info-strip">
        <div>
          <dt className="eyebrow">Hours</dt>
          <dd>11am – 10pm daily</dd>
        </div>
        <div>
          <dt className="eyebrow">Pickup at</dt>
          <dd>123 Campus Ave</dd>
        </div>
        <div>
          <dt className="eyebrow">Call us</dt>
          <dd>(555) 010-2020</dd>
        </div>
        <div>
          <dt className="eyebrow">Checkout</dt>
          <dd>No account needed</dd>
        </div>
      </dl>

      <section className="section favorites" aria-labelledby="fav-title">
        <div className="section__head">
          <h2 id="fav-title" className="display section__title">
            Fan favorites
          </h2>
          <a href="#/menu" className="text-btn">
            See full menu →
          </a>
        </div>
        <div className="fav-row">
          {favorites.map((id) => {
            const item = findItem(id)!
            return (
              <button
                key={id}
                type="button"
                className="fav card"
                onClick={() => (item.soldOut ? (window.location.hash = '/menu') : openCustomize(id))}
              >
                <img src={item.photo} alt="" className="fav__photo" />
                <span className="fav__text">
                  <strong>{item.name}</strong>
                  <span className="muted">
                    {item.sizes ? `from ${money(item.price)}` : money(item.price)}
                    {item.soldOut && ' · sold out today'}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
