import React, { useState } from 'react'
import './LaunchEvent.css'

const initialForm = {
  eventGroupName: '',
  peopleNames: '',
  peopleCount: '',
  date: '',
  time: '',
  eventType: '',
  location: '',
  contactNumber: '',
  email: '',
}

const LaunchEvent = ({ onRequestSubmit }) => {
  const [form, setForm] = useState(initialForm)
  const [submitted, setSubmitted] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  const submitRequest = async (event) => {
    event.preventDefault()

    try {
      await onRequestSubmit(form)
      setSubmitted(true)
      setForm(initialForm)
    } catch (error) {
      setSubmitted(false)
    }
  }

  return (
    <main className="launch-event-page">
      <section className="launch-event-intro" aria-labelledby="launch-event-title">
        <p className="launch-event-eyebrow">Make it yours at Coffee Shot</p>
        <h1 id="launch-event-title">Launch an<br /><em>event.</em></h1>
        <p>Tell us about your group and we will help shape a memorable table, tasting, or celebration.</p>
      </section>

      <section className="launch-event-form-section" aria-labelledby="launch-form-title">
        <div className="launch-event-form-heading">
          <p className="launch-event-eyebrow">Event request</p>
          <h2 id="launch-form-title">Bring your people together.</h2>
        </div>
        <form className="launch-event-form" onSubmit={submitRequest}>
          <label>Event group name
            <input name="eventGroupName" value={form.eventGroupName} onChange={updateField} placeholder="e.g. The Sunday Club" required />
          </label>
          <label>Names of people in event group
            <textarea name="peopleNames" value={form.peopleNames} onChange={updateField} placeholder="Add names separated by commas" rows="3" required />
          </label>
          <label>Number of people
            <input name="peopleCount" type="number" min="1" max="500" value={form.peopleCount} onChange={updateField} placeholder="e.g. 12" required />
          </label>
          <label>Date
            <input name="date" type="date" value={form.date} onChange={updateField} required />
          </label>
          <label>Time
            <input name="time" type="time" value={form.time} onChange={updateField} required />
          </label>
          <label>Type of event
            <select name="eventType" value={form.eventType} onChange={updateField} required>
              <option value="">Choose event type</option>
              <option value="birthday">Birthday</option>
              <option value="work-meetup">Work meetup</option>
              <option value="private-party">Private party</option>
              <option value="workshop">Workshop</option>
              <option value="music-event">Music event</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Location
            <input name="location" value={form.location} onChange={updateField} placeholder="e.g. Coffee Shot, Koramangala" required />
          </label>
          <label>Contact number
            <input name="contactNumber" type="tel" inputMode="tel" pattern="[0-9+ ()-]{7,}" value={form.contactNumber} onChange={updateField} placeholder="e.g. +91 98765 43210" required />
          </label>
          <label>Email ID
            <input name="email" type="email" value={form.email} onChange={updateField} placeholder="you@example.com" required />
          </label>
          <button className="launch-request-button" type="submit">Send request to admin <span aria-hidden="true">↗</span></button>
          {submitted && <p className="launch-request-success" role="status">Request sent to the Coffee Shot admin team.</p>}
        </form>
      </section>
    </main>
  )
}

export default LaunchEvent
