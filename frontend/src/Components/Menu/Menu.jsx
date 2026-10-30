import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Menu.css'

const API_URL = 'http://localhost:5000/api'

export let menuItems = []

const categories = ['All', 'Pizza', 'Maggie', 'Fries', 'Beverage', 'Mocktails', 'Sandwich']

const MenuCard = ({ item }) => (
  <Link className="menu-card-link" to="/description" aria-label={`View ${item.name} details`}>
    <article className="menu-card">
      <div className="menu-card-image-wrap">
        <img className="menu-card-image" src={item.image} alt={item.name} />
        <span className="menu-card-category">{item.category}</span>
      </div>
      <div className="menu-card-body">
        <div className="menu-card-heading">
          <h3>{item.name}</h3>
          <strong>{item.price}</strong>
        </div>
        <p>{item.description}</p>
        <div className="menu-card-meta">
          <span className="rating"><span aria-hidden="true">★</span> {item.rating}</span>
          <span>{item.time} to serve in dining</span>
        </div>
      </div>
    </article>
  </Link>
)

const Menu = () => {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('All')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeOffer, setActiveOffer] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [vegetarianOnly, setVegetarianOnly] = useState(false)
  const [sortBy, setSortBy] = useState('relevance')
  const [timeRange, setTimeRange] = useState('all')
  const [ratingFilter, setRatingFilter] = useState('all')
  const [offerFilter, setOfferFilter] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')
  const [collectionFilter, setCollectionFilter] = useState('all')
  const [menuList, setMenuList] = useState([])
  const [offers, setOffers] = useState([])

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [menuResponse, offerResponse] = await Promise.all([
          fetch(`${API_URL}/menu`),
          fetch(`${API_URL}/offers`),
        ])

        const menuData = await menuResponse.json()
        const offerData = await offerResponse.json()

        const normalizedMenuItems = Array.isArray(menuData?.data) ? menuData.data.map((item) => ({
          id: item._id || item.id,
          name: item.name,
          category: item.category || 'Menu',
          description: item.description,
          price: `₹${Number(item.price || 0)}`,
          time: item.time || '15 min',
          rating: String(item.rating || '4.5'),
          image: item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85',
          recommended: Boolean(item.recommended),
          filters: {
            vegetarian: item.vegetarian ?? true,
            offer: item.offer || 'deal-of-the-day',
            collection: item.collection || 'new-to-you',
          },
        })) : []

        menuItems = normalizedMenuItems
        setMenuList(normalizedMenuItems)
        setOffers(Array.isArray(offerData?.data) && offerData.data.length ? offerData.data.map((offer) => ({
          title: offer.title,
          detail: offer.description,
          offer: offer.discountPercent ? `${offer.discountPercent}% off` : 'Special offer',
          image: offer.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1500&q=85',
        })) : [])
      } catch (error) {
        console.error('Failed to load menu data:', error)
        menuItems = []
        setMenuList([])
        setOffers([])
      }
    }

    fetchMenuData()
  }, [])

  useEffect(() => {
    if (!offers.length) return undefined

    const timer = window.setInterval(() => {
      setActiveOffer((current) => (current + 1) % offers.length)
    }, 5500)
    return () => window.clearInterval(timer)
  }, [offers.length])

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchingItems = menuList.filter((item) => {
      const matchesCategory = activeCategory === 'All' || item.category === activeCategory
      const matchesSearch = !normalizedSearch || `${item.name} ${item.description} ${item.category}`.toLowerCase().includes(normalizedSearch)
      const matchesVegetarian = !vegetarianOnly || item.filters.vegetarian
      const matchesRating = ratingFilter === 'all' || Number(item.rating) >= Number(ratingFilter)
      const matchesOffer = offerFilter === 'all' || item.filters.offer === offerFilter
      const matchesPrice = priceFilter === 'all' || Number(item.price.slice(1)) < Number(priceFilter)
      const matchesCollection = collectionFilter === 'all' || item.filters.collection === collectionFilter
      const itemTime = Number(item.time)
      const matchesTime = timeRange === 'all' || (() => {
        const [minimum, maximum] = timeRange.split('-').map(Number)
        return itemTime >= minimum && itemTime <= maximum
      })()
      return matchesCategory && matchesSearch && matchesVegetarian && matchesRating && matchesOffer && matchesPrice && matchesCollection && matchesTime
    })

    return [...matchingItems].sort((firstItem, secondItem) => {
      if (sortBy === 'price-low') return Number(firstItem.price.slice(1)) - Number(secondItem.price.slice(1))
      if (sortBy === 'price-high') return Number(secondItem.price.slice(1)) - Number(firstItem.price.slice(1))
      if (sortBy === 'rating-desc') return Number(secondItem.rating) - Number(firstItem.rating)
      return firstItem.id - secondItem.id
    })
  }, [activeCategory, collectionFilter, offerFilter, menuList, priceFilter, ratingFilter, searchTerm, sortBy, timeRange, vegetarianOnly])

  const removeFilters = () => {
    setVegetarianOnly(false)
    setSortBy('relevance')
    setTimeRange('all')
    setRatingFilter('all')
    setOfferFilter('all')
    setPriceFilter('all')
    setCollectionFilter('all')
  }

  return (
    <main className="menu-page">
      <section className="menu-hero" aria-labelledby="menu-title">
        <div className="menu-hero-copy">
          <p className="menu-eyebrow">The Coffee Shot menu</p>
          <h1 id="menu-title">Good food.<br /><em>Better pauses.</em></h1>
          <p>Made fresh for the table, from the first coffee to the last shared fry.</p>
        </div>
        <div className="menu-search-wrap">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            type="search"
            aria-label="Search the menu"
            placeholder="Search pizza, coffee, fries..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <span className="veg-marker" title="Vegetarian options available" aria-label="Vegetarian options available">V</span>
        </div>
      </section>

      {offers.length > 0 && (
        <section className="offer-slider" id="cafe-offers" aria-label="Cafe offers">
          <div className="offer-slide" style={{ backgroundImage: `linear-gradient(90deg, rgba(32, 34, 30, .76), rgba(32, 34, 30, .12)), url(${offers[activeOffer].image})` }}>
            <div className="offer-copy">
              <p className="menu-eyebrow">Today at Coffee Shot</p>
              <h2>{offers[activeOffer].title}</h2>
              <p>{offers[activeOffer].detail}</p>
              <strong>{offers[activeOffer].offer}</strong>
            </div>
            <div className="offer-controls">
              <button type="button" aria-label="Previous offer" onClick={() => setActiveOffer((activeOffer - 1 + offers.length) % offers.length)}>←</button>
              <div className="offer-dots" aria-label="Choose an offer">
                {offers.map((offer, index) => <button key={offer.title} className={index === activeOffer ? 'is-active' : ''} type="button" aria-label={`Show offer ${index + 1}`} onClick={() => setActiveOffer(index)} />)}
              </div>
              <button type="button" aria-label="Next offer" onClick={() => setActiveOffer((activeOffer + 1) % offers.length)}>→</button>
            </div>
          </div>
        </section>
      )}

      <section className="menu-content" aria-labelledby="menu-list-title">
        <div className="category-row">
          <div>
            <p className="menu-eyebrow">Find your favorite</p>
            <h2 id="menu-list-title">Explore the menu</h2>
          </div>
          <div className="menu-actions">
            <button className="outline-action" type="button" onClick={() => navigate('/offers')}>Explore offers <span aria-hidden="true">↗</span></button>
            <button className={`filter-action ${showFilters ? 'is-active' : ''}`} type="button" onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} aria-controls="menu-filter-panel">Filter <span aria-hidden="true">☷</span></button>
          </div>
        </div>

        <div className="category-tools">
          <div className="category-slider" aria-label="Menu categories">
            {categories.map((category) => (
              <button key={category} className={activeCategory === category ? 'is-active' : ''} type="button" onClick={() => setActiveCategory(category)}>{category}</button>
            ))}
          </div>
          {showFilters && (
            <div className="filter-panel" id="menu-filter-panel">
              <label><input type="checkbox" checked={vegetarianOnly} onChange={(event) => setVegetarianOnly(event.target.checked)} /> Vegetarian</label>
              <label className="sort-label">Sort by
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="rating-desc">Rating: high to low</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
              </label>
              <label className="sort-label">Time
                <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
                  <option value="all">Any serving time</option>
                  <option value="10-20">Min 10 min - max 20 min</option>
                  <option value="20-30">Min 20 min - max 30 min</option>
                  <option value="30-40">Min 30 min - max 40 min</option>
                  <option value="40-50">Min 40 min - max 50 min</option>
                </select>
              </label>
              <label className="sort-label">Rating
                <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
                  <option value="all">All ratings</option>
                  <option value="3.5">Rated 3.5+</option>
                  <option value="4.0">Rated 4.0+</option>
                </select>
              </label>
              <label className="sort-label">Offers
                <select value={offerFilter} onChange={(event) => setOfferFilter(event.target.value)}>
                  <option value="all">All offers</option>
                  <option value="buy-one-get-one">Buy 1 Get 1 and more</option>
                  <option value="deal-of-the-day">Deals of the day</option>
                </select>
              </label>
              <label className="sort-label">Dish price
                <select value={priceFilter} onChange={(event) => setPriceFilter(event.target.value)}>
                  <option value="all">Any price</option>
                  <option value="100">Under ₹100</option>
                  <option value="200">Under ₹200</option>
                  <option value="300">Under ₹300</option>
                </select>
              </label>
              <label className="sort-label">Collections
                <select value={collectionFilter} onChange={(event) => setCollectionFilter(event.target.value)}>
                  <option value="all">All collections</option>
                  <option value="previously-ordered">Previously ordered</option>
                  <option value="new-to-you">New to you</option>
                </select>
              </label>
              <button className="remove-filter" type="button" onClick={removeFilters}>Remove filter</button>
            </div>
          )}
        </div>

        <section className="recommendation-section" aria-labelledby="recommendation-title">
          <div className="section-heading">
            <div><p className="menu-eyebrow">Picked for your table</p><h2 id="recommendation-title">Recommendations for you</h2></div>
            <span className="scroll-hint">Swipe to explore →</span>
          </div>
          <div className="recommendation-track">
            {menuList.filter((item) => item.recommended).map((item) => <MenuCard item={item} key={item.id} />)}
          </div>
        </section>

        <section className="all-menu-section" aria-labelledby="all-menu-title">
          <div className="section-heading">
            <div><p className="menu-eyebrow">Made to order</p><h2 id="all-menu-title">All menu</h2></div>
            <span className="result-count">{filteredItems.length} items</span>
          </div>
          <div className="menu-grid">
            {filteredItems.length ? filteredItems.map((item) => <MenuCard item={item} key={item.id} />) : <p className="empty-menu">No dishes match that search yet. Try another craving.</p>}
          </div>
        </section>

      </section>
    </main>
  )
}

export default Menu
