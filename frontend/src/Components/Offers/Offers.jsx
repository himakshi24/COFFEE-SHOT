import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import './Offers.css'

const API_URL = 'http://localhost:5000/api'

const normalizeMenuItem = (item) => ({
  id: item._id || item.id,
  photo: item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
  name: item.name,
  description: item.description,
  price: `₹${Number(item.price || 0)}`,
  rating: String(item.rating || '4.5'),
  serveTime: item.time || '15 min',
  recommended: Boolean(item.recommended),
  offerType: item.offer || 'deal-of-the-day',
  offerLabel: item.offer === 'buy-one-get-one' ? 'Buy 1 Get 1 Free' : 'Daily Deal',
  dailyDeal: item.offer === 'deal-of-the-day',
})

const OfferCard = ({ item }) => (
  <Link className="offer-card-link" to="/description" aria-label={`View ${item.name} offer details`}>
    <article className="offer-card">
      <div className="offer-card-image-wrap">
        <img src={item.photo} alt={item.name} className="offer-card-image" />
        <span className="offer-card-label">{item.offerLabel}</span>
      </div>
      <div className="offer-card-content">
        <div className="offer-card-title-row">
          <h3>{item.name}</h3>
          <strong>{item.price}</strong>
        </div>
        <p>{item.description}</p>
        <div className="offer-card-meta">
          <span><span className="offer-star" aria-hidden="true">★</span> {item.rating}</span>
          <span>{item.serveTime} to serve</span>
        </div>
      </div>
    </article>
  </Link>
)

const OfferSlider = ({ items }) => (
  <div className="offer-card-track">
    {items.map((item) => <OfferCard item={item} key={item.id} />)}
  </div>
)

const Offers = () => {
  const [offerItems, setOfferItems] = useState([])

  useEffect(() => {
    const fetchOfferItems = async () => {
      try {
        const response = await fetch(`${API_URL}/menu`)
        const data = await response.json()

        const normalized = Array.isArray(data?.data) ? data.data.map(normalizeMenuItem) : []
        setOfferItems(normalized)
      } catch (error) {
        console.error('Failed to load offers:', error)
        setOfferItems([])
      }
    }

    fetchOfferItems()
  }, [])

  const tryNewDeals = offerItems.filter((item) => item.recommended)
  const dailyDeals = offerItems.filter((item) => item.dailyDeal)

  return (
    <main className="description-page">
      <section className="description-intro" aria-labelledby="offers-title">
        <p className="description-eyebrow">Fresh from Coffee Shot</p>
        <h1 id="offers-title">GREAT <span>OFFERS</span></h1>
        <p className="description-lead">Try something new, find your next favorite, and make today’s coffee pause a little more delicious.</p>
      </section>

      <section className="description-section" aria-labelledby="try-deals-title">
        <div className="description-section-heading">
          <div>
            <p className="description-eyebrow">Recommended for you</p>
            <h2 id="try-deals-title">Try New Deals</h2>
          </div>
          <span className="description-scroll-hint">Swipe to explore →</span>
        </div>
        <OfferSlider items={tryNewDeals} />
      </section>

      <section className="description-section daily-deals-section" aria-labelledby="daily-deals-title">
        <div className="description-section-heading">
          <div>
            <p className="description-eyebrow">Today’s picks</p>
            <h2 id="daily-deals-title">Daily Deals</h2>
          </div>
          <span className="description-scroll-hint">Made fresh today</span>
        </div>
        <OfferSlider items={dailyDeals} />
      </section>
    </main>
  )
}

export default Offers
