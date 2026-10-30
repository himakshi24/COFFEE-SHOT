import React, { useEffect, useState } from 'react'
import './Description.css'

const API_URL = 'http://localhost:5000/api'

const stars = [1, 2, 3, 4, 5]

const normalizeMenuItem = (item) => ({
  id: item._id || item.id,
  name: item.name,
  category: item.category || 'Menu',
  description: item.description,
  price: `₹${Number(item.price || 0)}`,
  time: item.time || '15 min',
  rating: String(item.rating || '4.5'),
  image: item.image || 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1500&q=85',
  recommended: Boolean(item.recommended),
  filters: {
    vegetarian: item.vegetarian ?? true,
    offer: item.offer || 'deal-of-the-day',
    collection: item.collection || 'new-to-you',
  },
})

const getPriceValue = (price) => Number(String(price).replace(/[^0-9.]/g, ''))

const StarRating = ({ value, onChange, label }) => (
  <div className="description-stars" aria-label={label}>
    {stars.map((star) => (
      <button
        key={star}
        className={star <= value ? 'is-filled' : ''}
        type="button"
        aria-label={`${star} star${star === 1 ? '' : 's'}`}
        onClick={() => onChange(star)}
      >
        ★
      </button>
    ))}
  </div>
)

const Description = () => {
  const [menuList, setMenuList] = useState([])
  const [descriptionItem, setDescriptionItem] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewName, setReviewName] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [shareMessage, setShareMessage] = useState('')
  const [orderPlaced, setOrderPlaced] = useState(false)
  const currentUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch (error) {
      return null
    }
  }, [])

  const getAuthHeaders = React.useCallback(() => {
    const token = localStorage.getItem('token')

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }, [])

  const fetchMenuReviews = React.useCallback(async (itemId) => {
    if (!itemId) {
      setReviews([])
      return
    }

    try {
      const response = await fetch(`${API_URL}/menu-reviews?itemId=${encodeURIComponent(itemId)}`)
      const data = await response.json()

      if (!response.ok || !data.success || !Array.isArray(data.data)) {
        setReviews([])
        return
      }

      const mappedReviews = data.data.map((review) => {
        const item = review.itemId && typeof review.itemId === 'object' ? review.itemId : null
        const user = review.userId && typeof review.userId === 'object' ? review.userId : null

        return {
          id: review._id || review.id,
          itemId: String(review.itemId || item?._id || itemId || ''),
          userId: user?._id ? String(user._id) : review.userId ? String(review.userId) : '',
          customer: review.customer || user?.name || 'Guest',
          rating: Number(review.rating || 0),
          message: review.message,
        }
      })

      setReviews(mappedReviews)
    } catch (error) {
      console.error('Failed to fetch menu reviews:', error)
      setReviews([])
    }
  }, [])

  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch(`${API_URL}/menu`)
        const data = await response.json()

        const normalized = Array.isArray(data?.data) ? data.data.map(normalizeMenuItem) : []
        setMenuList(normalized)

        const itemId = new URLSearchParams(window.location.search).get('itemId')
        const selectedItem = normalized.find((item) => String(item.id) === String(itemId)) || normalized[0] || null
        setDescriptionItem(selectedItem)
      } catch (error) {
        console.error('Failed to load menu item:', error)
        setMenuList([])
        setDescriptionItem(null)
      }
    }

    fetchMenuData()
  }, [])

  useEffect(() => {
    if (!descriptionItem?.id) {
      setReviews([])
      return
    }

    fetchMenuReviews(String(descriptionItem.id))
  }, [descriptionItem?.id, fetchMenuReviews])

  const averageRating = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : Number(descriptionItem?.rating || 0)

  const addToCart = (item) => {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return currentItems.map((cartItem) => cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1 }
          : cartItem)
      }
      return [...currentItems, { ...item, quantity: 1 }]
    })
  }

  const changeQuantity = (itemId, amount) => {
    setCartItems((currentItems) => currentItems
      .map((item) => item.id === itemId ? { ...item, quantity: item.quantity + amount } : item)
      .filter((item) => item.quantity > 0))
  }

  const cartTotal = cartItems.reduce((total, item) => total + getPriceValue(item.price) * item.quantity, 0)
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)

  const placeOrder = async () => {
    if (!cartItems.length) return

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: JSON.parse(localStorage.getItem('user') || 'null')?.name || 'Guest',
          status: 'placed',
          items: cartItems.map((item) => ({
            itemId: String(item.id),
            id: String(item.id),
            name: item.name,
            price: getPriceValue(item.price),
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to place the order.')
      }

      setOrderPlaced(true)
      setCartItems([])
      return data
    } catch (error) {
      console.error('Failed to place order:', error)
      setOrderPlaced(false)
      window.alert(error.message || 'Unable to place the order.')
      return null
    }
  }

  const submitReview = async (event) => {
    event.preventDefault()
    if (!reviewName.trim() || !reviewMessage.trim() || !descriptionItem?.id) return

    const token = localStorage.getItem('token')
    if (!token) {
      window.alert('Please log in before posting or editing a review.')
      return
    }

    try {
      const payload = {
        itemId: String(descriptionItem.id),
        customer: reviewName.trim(),
        rating: reviewRating,
        message: reviewMessage.trim(),
      }

      const response = await fetch(
        editingReviewId ? `${API_URL}/menu-reviews/${editingReviewId}` : `${API_URL}/menu-reviews`,
        {
          method: editingReviewId ? 'PUT' : 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      )

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Unable to save the review.')
      }

      setReviewName('')
      setReviewMessage('')
      setReviewRating(5)
      setEditingReviewId(null)
      await fetchMenuReviews(String(descriptionItem.id))
      window.alert(data.message || 'Review saved successfully.')
    } catch (error) {
      window.alert(error.message)
    }
  }

  const canManageReview = (review) => {
    const userId = currentUser?.id || currentUser?._id

    if (!userId) {
      return false
    }

    return String(review.userId || '') === String(userId)
  }

  const editReview = (review) => {
    setEditingReviewId(review.id)
    setReviewName(review.customer)
    setReviewMessage(review.message)
    setReviewRating(review.rating)
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const deleteReview = async (reviewId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.alert('Please log in before deleting a review.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/menu-reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete the review.')
      }

      await fetchMenuReviews(String(descriptionItem.id))
      if (editingReviewId === reviewId) {
        setEditingReviewId(null)
        setReviewName('')
        setReviewMessage('')
        setReviewRating(5)
      }
    } catch (error) {
      window.alert(error.message)
    }
  }

  const sharePage = async () => {
    if (!descriptionItem) return

    const shareData = { title: descriptionItem.name, text: `Try ${descriptionItem.name} at Coffee Shot`, url: window.location.href }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setShareMessage('Link copied')
      }
    } catch (error) {
      if (error.name !== 'AbortError') setShareMessage('Unable to share right now')
    }
  }

  if (!descriptionItem) {
    return (
      <main className="description-page">
        <section className="description-product" aria-live="polite">
          <p className="description-eyebrow">Loading menu item...</p>
        </section>
      </main>
    )
  }

  return (
    <main className="description-page">
      <section className="description-product" aria-labelledby="food-title">
        <div className="description-product-image-wrap">
          <img src={descriptionItem.image} alt={descriptionItem.name} className="description-product-image" />
        </div>
        <div className="description-product-copy">
          <p className="description-eyebrow">Fresh from the Coffee Shot kitchen</p>
          <h1 id="food-title">{descriptionItem.name}</h1>
          <div className="description-product-rating"><span aria-hidden="true">★</span> {descriptionItem.rating} <span>({reviews.length} reviews)</span></div>
          <p className="description-product-text">{descriptionItem.description}</p>
          <div className="description-product-details">
            <strong>{descriptionItem.price}</strong>
            <span>{descriptionItem.time} to serve in dining</span>
          </div>
          <div className="description-product-actions">
            <button className="description-cart-button" type="button" onClick={() => addToCart(descriptionItem)}>{cartItems.some((item) => item.id === descriptionItem.id) ? 'Add one more' : 'Add to cart'} <span aria-hidden="true">+</span></button>
            <button className="description-share-button" type="button" onClick={sharePage} aria-label="Share this food page">⌯ <span>Share</span></button>
          </div>
          {shareMessage && <p className="description-share-message" role="status">{shareMessage}</p>}
        </div>
      </section>

      {cartItems.length > 0 && (
        <section className="description-cart" aria-labelledby="cart-title">
          <div className="description-cart-heading">
            <div>
              <p className="description-eyebrow">Your table order</p>
              <h2 id="cart-title">Cart <span>{cartCount} item{cartCount === 1 ? '' : 's'}</span></h2>
            </div>
            <strong className="description-cart-total">₹{cartTotal}</strong>
          </div>
          <div className="description-cart-items">
            {cartItems.map((item) => (
              <article className="description-cart-item" key={item.id}>
                <img src={item.image} alt={item.name} />
                <div className="description-cart-item-copy">
                  <h3>{item.name}</h3>
                  <span>{item.price} each</span>
                </div>
                <div className="description-quantity" aria-label={`Quantity for ${item.name}`}>
                  <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => changeQuantity(item.id, -1)}>-</button>
                  <strong>{item.quantity}</strong>
                  <button type="button" aria-label={`Add one ${item.name}`} onClick={() => changeQuantity(item.id, 1)}>+</button>
                </div>
                <strong className="description-cart-item-price">₹{getPriceValue(item.price) * item.quantity}</strong>
              </article>
            ))}
          </div>
          <div className="description-add-more">
            <span>Add more food</span>
            <div>
              {menuList.filter((item) => item.id !== descriptionItem.id).slice(0, 3).map((item) => (
                <button type="button" key={item.id} onClick={() => addToCart(item)}>{item.name} +</button>
              ))}
            </div>
          </div>
          <div className="description-order-row">
            <button className="description-order-button" type="button" onClick={placeOrder}>Order now <span aria-hidden="true">→</span></button>
            {orderPlaced && <p className="description-order-message" role="status">Order started for {cartCount} item{cartCount === 1 ? '' : 's'}.</p>}
          </div>
        </section>
      )}

      <section className="description-reviews" aria-labelledby="reviews-title">
        <div className="description-reviews-heading">
          <div>
            <p className="description-eyebrow">From the table</p>
            <h2 id="reviews-title">Ratings &amp; reviews</h2>
          </div>
          <div className="description-average-rating"><strong>{averageRating}</strong><span>★</span><small>{reviews.length} customer reviews</small></div>
        </div>

        <div className="description-review-layout">
          <form className="description-review-form" id="review-form" onSubmit={submitReview}>
            <h3>{editingReviewId ? 'Edit your review' : 'Share your experience'}</h3>
            <label>Your name<input type="text" value={reviewName} onChange={(event) => setReviewName(event.target.value)} placeholder="Enter your name" required /></label>
            <label>Your rating<StarRating value={reviewRating} onChange={setReviewRating} label="Choose a rating" /></label>
            <label>Your review<textarea value={reviewMessage} onChange={(event) => setReviewMessage(event.target.value)} placeholder="How was your meal?" rows="4" required /></label>
            <div className="description-review-form-actions">
              <button className="description-submit-review" type="submit">{editingReviewId ? 'Save changes' : 'Post review'} <span aria-hidden="true">↗</span></button>
              {editingReviewId && <button className="description-cancel-review" type="button" onClick={() => { setEditingReviewId(null); setReviewName(''); setReviewMessage(''); setReviewRating(5) }}>Cancel</button>}
            </div>
          </form>

          <div className="description-review-list">
            {reviews.map((review) => (
              <article className="description-review" key={review.id}>
                <div className="description-review-topline"><strong>{review.customer}</strong><span>{stars.map((star) => <span className={star <= review.rating ? 'is-filled' : ''} key={star}>★</span>)}</span></div>
                <p>{review.message}</p>
                {canManageReview(review) && (
                  <div className="description-review-actions"><button type="button" onClick={() => editReview(review)}>Edit</button><button type="button" onClick={() => deleteReview(review.id)}>Delete</button></div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Description
