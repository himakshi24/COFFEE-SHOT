import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './Events.css'

const API_URL = 'http://localhost:5000/api'

// Admin panel data contract: replace these records with event API data later.
export const contestSlides = [
  {
    id: 1,
    title: 'The Coffee Shot Latte Art Contest',
    detail: 'Pour, perform, and win a month of coffee on us.',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1500&q=85',
  },
  {
    id: 2,
    title: 'Sunday Bake-Off',
    detail: 'Bring your best bake and share the table with the neighborhood.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1500&q=85',
  },
  {
    id: 3,
    title: 'Brew Your Signature Cup',
    detail: 'A friendly brew battle for curious coffee makers.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1500&q=85',
  },
]

export const previousEvents = [
  {
    id: 1,
    name: 'Acoustic Evenings',
    time: '7:00 PM - 9:30 PM',
    date: '18 May 2026',
    rating: '4.9',
    location: 'Coffee Shot, Koramangala',
    image: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 2,
    name: 'The Great Latte Art Jam',
    time: '4:00 PM - 7:00 PM',
    date: '04 May 2026',
    rating: '4.8',
    location: 'Coffee Shot, Indiranagar',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 3,
    name: 'Poetry Over Pour-Over',
    time: '6:30 PM - 8:30 PM',
    date: '21 April 2026',
    rating: '4.7',
    location: 'Coffee Shot, HSR Layout',
    image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85',
  },
]

export const upcomingEvents = [
  {
    id: 4,
    name: 'Coffee & Canvas',
    time: '5:00 PM - 7:30 PM',
    date: '28 June 2026',
    location: 'Coffee Shot, Koramangala',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 5,
    name: 'Open Mic After Hours',
    time: '7:30 PM - 10:00 PM',
    date: '05 July 2026',
    location: 'Coffee Shot, Indiranagar',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=900&q=85',
  },
  {
    id: 6,
    name: 'Sunday Brunch Club',
    time: '11:00 AM - 1:30 PM',
    date: '12 July 2026',
    location: 'Coffee Shot, HSR Layout',
    image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=85',
  },
]

// Host view data contract: replace with event-request status data from the admin API.
export const hostEventRequests = [
  {
    id: 1,
    groupName: 'The Sunday Club',
    eventType: 'Workshop',
    date: '28 June 2026',
    time: '5:00 PM',
    peopleCount: 12,
    location: 'Coffee Shot, Koramangala',
    status: 'pending',
  },
  {
    id: 2,
    groupName: 'Maya Music Circle',
    eventType: 'Music event',
    date: '05 July 2026',
    time: '7:30 PM',
    peopleCount: 24,
    location: 'Coffee Shot, Indiranagar',
    status: 'pending',
  },
]

// Replace these records with the admin panel response when the backend is connected.
export const eventPageData = {
  contests: contestSlides,
  previousEvents,
  upcomingEvents,
  hostRequests: hostEventRequests,
  initialReviews: [
    { id: 1, eventId: 1, customer: 'Aarav', rating: 5, message: 'The music, coffee, and atmosphere were wonderful.' },
    { id: 2, eventId: 2, customer: 'Maya', rating: 4, message: 'Such a fun evening and the latte art was beautiful.' },
  ],
}

const EventCard = ({ event, previous = false, onBookEvent }) => (
  <article className="event-card">
    <div className="event-card-image-wrap">
      <img src={event.image} alt={event.name} className="event-card-image" />
      <span className={`event-card-label ${previous ? 'is-previous' : ''}`}>{previous ? 'Previous event' : 'Book now'}</span>
    </div>
    <div className="event-card-content">
      <h3>{event.name}</h3>
      <div className="event-card-detail"><span aria-hidden="true">◷</span><span>{event.date} · {event.time}</span></div>
      <div className="event-card-detail"><span aria-hidden="true">⌖</span><span>{event.location}</span></div>
      {event.rating && <div className="event-card-rating"><span aria-hidden="true">★</span> {event.rating} attendee rating</div>}
      {!previous && <button className="event-book-button" type="button" onClick={() => onBookEvent(event)}>Book now <span aria-hidden="true">↗</span></button>}
    </div>
  </article>
)

const reviewStars = [1, 2, 3, 4, 5]

const hostRequestStatus = {
  pending: 'Pending request',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

const Events = () => {
  const { contests, previousEvents: pastEvents, upcomingEvents: recentEvents, hostRequests } = eventPageData
  const [activeSlide, setActiveSlide] = useState(0)
  const [eventReviews, setEventReviews] = useState([])
  const [reviewEventId, setReviewEventId] = useState(String(pastEvents[0].id))
  const [reviewCustomer, setReviewCustomer] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [upcomingEventList, setUpcomingEventList] = useState(recentEvents)
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null')
    } catch (error) {
      return null
    }
  }, [])
  const reviewableEvents = useMemo(
    () => (upcomingEventList.length ? upcomingEventList : pastEvents),
    [upcomingEventList, pastEvents]
  )

  const fetchEventReviews = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/event-reviews`)
      const data = await response.json()

      if (!response.ok || !data.success || !Array.isArray(data.data)) {
        return
      }

      const eventMap = new Map(
        [...upcomingEventList, ...pastEvents].map((eventItem) => [String(eventItem._id || eventItem.id), eventItem.name])
      )

      const mappedReviews = data.data.map((review) => {
        const eventId = review.eventId && typeof review.eventId === 'object' ? review.eventId._id : review.eventId
        const reviewUserId = review.userId && typeof review.userId === 'object' ? review.userId._id : review.userId
        const eventName = review.eventId && typeof review.eventId === 'object'
          ? review.eventId.title
          : eventMap.get(String(eventId || '')) || 'Event'

        return {
          id: review._id || review.id,
          eventId: String(eventId || ''),
          userId: reviewUserId ? String(reviewUserId) : '',
          customer: review.customer,
          rating: Number(review.rating),
          message: review.message,
          eventName,
        }
      })

      setEventReviews(mappedReviews)
    } catch (error) {
      console.error('Failed to fetch event reviews:', error)
    }
  }, [pastEvents, upcomingEventList])

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % contests.length), 5000)
    return () => window.clearInterval(timer)
  }, [contests.length])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_URL}/events`)
        const data = await response.json()

        if (!response.ok || !data.success || !Array.isArray(data.data)) {
          return
        }

        const mappedEvents = data.data.map((event) => {
          const eventDate = new Date(event.date)

          return {
            ...event,
            id: event._id,
            _id: event._id,
            name: event.title,
            date: eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            time: eventDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            location: event.location,
            image: event.image || 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=900&q=85',
          }
        })

        if (mappedEvents.length) {
          setUpcomingEventList(mappedEvents)
          setReviewEventId(String(mappedEvents[0]._id || mappedEvents[0].id))
        }
      } catch (error) {
        console.error('Failed to fetch events:', error)
      }
    }

    fetchEvents()
  }, [])

  useEffect(() => {
    fetchEventReviews()
  }, [fetchEventReviews])

  const currentContest = contests[activeSlide]

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token')

    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }, [])

  const handleBookEvent = async (eventItem) => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const user = savedUser ? JSON.parse(savedUser) : null

    if (!token) {
      window.alert('Please log in before booking an event.')
      window.location.href = '/login'
      return
    }

    try {
      const response = await fetch(`${API_URL}/event-bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          eventId: eventItem._id || eventItem.id,
          name: user?.name || 'Guest',
          email: user?.email || '',
          phone: '',
          guestCount: 1,
          message: `Booking request for ${eventItem.name}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Booking request failed.')
      }

      window.alert(data.message || 'Booking request sent successfully.')
    } catch (error) {
      window.alert(error.message)
    }
  }

  const submitEventReview = async (event) => {
    event.preventDefault()
    if (!reviewCustomer.trim() || !reviewMessage.trim()) return

    if (!localStorage.getItem('token')) {
      window.alert('Please log in before posting or editing a review.')
      return
    }

    try {
      const payload = {
        eventId: reviewEventId,
        customer: reviewCustomer.trim(),
        rating: reviewRating,
        message: reviewMessage.trim(),
      }

      const response = await fetch(
        editingReviewId ? `${API_URL}/event-reviews/${editingReviewId}` : `${API_URL}/event-reviews`,
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

      setReviewCustomer('')
      setReviewMessage('')
      setReviewRating(5)
      setEditingReviewId(null)
      await fetchEventReviews()
      window.alert(data.message || 'Review saved successfully.')
    } catch (error) {
      window.alert(error.message)
    }
  }

  const deleteEventReview = async (reviewId) => {
    if (!localStorage.getItem('token')) {
      window.alert('Please log in before deleting a review.')
      return
    }

    try {
      const response = await fetch(`${API_URL}/event-reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Unable to delete the review.')
      }

      await fetchEventReviews()
      if (editingReviewId === reviewId) {
        setEditingReviewId(null)
        setReviewCustomer('')
        setReviewMessage('')
        setReviewRating(5)
      }
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

  const editEventReview = (review) => {
    setEditingReviewId(review.id)
    setReviewEventId(review.eventId)
    setReviewCustomer(review.customer)
    setReviewMessage(review.message)
    setReviewRating(review.rating)
    document.getElementById('event-review-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <main className="events-page">
      <section className="events-intro" aria-labelledby="events-title">
        <p className="events-eyebrow">Gather at Coffee Shot</p>
        <h1 id="events-title">Good coffee.<br /><em>Good company.</em></h1>
        <p>There is always room for one more at the table. Find your next evening, contest, or reason to linger.</p>
      </section>

      <section className="contest-slider" aria-label="Coffee Shot contests">
        <div className="contest-slide" style={{ backgroundImage: `linear-gradient(90deg, rgba(32, 34, 30, .78), rgba(32, 34, 30, .12)), url(${currentContest.image})` }}>
          <div className="contest-copy">
            <p className="events-eyebrow">Featured contest</p>
            <h2>{currentContest.title}</h2>
            <p>{currentContest.detail}</p>
            <button className="event-book-button" type="button" onClick={() => window.alert(`Contest booking request for ${currentContest.title} has been noted.`)}>Book now <span aria-hidden="true">↗</span></button>
          </div>
          <div className="contest-controls">
            <button type="button" aria-label="Previous contest" onClick={() => setActiveSlide((activeSlide - 1 + contests.length) % contests.length)}>←</button>
            {contests.map((slide, index) => <button key={slide.id} className={index === activeSlide ? 'is-active' : ''} type="button" aria-label={`Show contest ${index + 1}`} onClick={() => setActiveSlide(index)} />)}
            <button type="button" aria-label="Next contest" onClick={() => setActiveSlide((activeSlide + 1) % contests.length)}>→</button>
          </div>
        </div>
      </section>

      <section className="events-section" aria-labelledby="previous-events-title">
        <div className="events-section-heading"><div><p className="events-eyebrow">Memories from the table</p><h2 id="previous-events-title">Previous contests</h2></div><span>Swipe to explore →</span></div>
        <div className="events-card-track">{pastEvents.map((event) => <EventCard event={event} previous key={event.id} onBookEvent={handleBookEvent} />)}</div>
        <div className="event-review-area">
          <div className="event-review-heading"><div><p className="events-eyebrow">Share your event experience</p><h3>Ratings &amp; reviews</h3></div><span>{eventReviews.length} customer reviews</span></div>
          <div className="event-review-layout">
            <form className="event-review-form" id="event-review-form" onSubmit={submitEventReview}>
              <label>Event<select value={reviewEventId} onChange={(event) => setReviewEventId(event.target.value)}>{reviewableEvents.map((eventOption) => <option key={eventOption._id || eventOption.id} value={String(eventOption._id || eventOption.id)}>{eventOption.name}</option>)}</select></label>
              <label>Your name<input value={reviewCustomer} onChange={(event) => setReviewCustomer(event.target.value)} placeholder="Enter your name" required /></label>
              <label>Rating<div className="event-review-stars">{reviewStars.map((star) => <button className={star <= reviewRating ? 'is-filled' : ''} key={star} type="button" aria-label={`${star} star${star === 1 ? '' : 's'}`} onClick={() => setReviewRating(star)}>★</button>)}</div></label>
              <label>Your review<textarea value={reviewMessage} onChange={(event) => setReviewMessage(event.target.value)} placeholder="Tell us about the event" rows="3" required ></textarea></label>
              <button className="event-review-submit" type="submit">{editingReviewId ? 'Save review' : 'Post review'} <span aria-hidden="true">↗</span></button>
            </form>
            <div className="event-review-list">
              {eventReviews.map((review) => (
                <article className="event-review" key={review.id}>
                  <div className="event-review-topline">
                    <strong>{review.customer}</strong>
                    <span>{reviewStars.map((star) => <span className={star <= review.rating ? 'is-filled' : ''} key={star}>★</span>)}</span>
                  </div>
                  <small>{review.eventName}</small>
                  <p>{review.message}</p>
                  {canManageReview(review) && (
                    <div className="event-review-actions">
                      <button type="button" onClick={() => editEventReview(review)}>Edit</button>
                      <button type="button" onClick={() => deleteEventReview(review.id)}>Delete</button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="events-section recent-events-section" aria-labelledby="recent-events-title">
        <div className="events-section-heading">
          <div><p className="events-eyebrow">Happening soon</p><h2 id="recent-events-title">Recent events</h2></div>
          <Link className="launch-event-button" to="/launch">Launch an event request <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="events-card-track">{upcomingEventList.map((event) => <EventCard event={event} key={event.id} onBookEvent={handleBookEvent} />)}</div>
        <div className="host-request-area" aria-labelledby="host-requests-title">
          <div className="event-review-heading">
            <div><p className="events-eyebrow">Host view</p><h3 id="host-requests-title">Your event requests</h3></div>
            <span>Request status</span>
          </div>
          <div className="host-request-list">
            {hostRequests.map((request) => (
              <article className="host-request-card" key={request.id}>
                <div className="host-request-card-heading">
                  <div><span className="host-request-label">{request.eventType}</span><h4>{request.groupName}</h4></div>
                  <span className={`host-request-status is-${request.status}`}>{hostRequestStatus[request.status]}</span>
                </div>
                <div className="host-request-details"><span>{request.date} · {request.time}</span><span>{request.peopleCount} people</span><span>{request.location}</span></div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Events
