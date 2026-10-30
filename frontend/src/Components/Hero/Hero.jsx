import React from 'react'
import { Link } from 'react-router-dom'
import './Hero.css'

const Hero = () => {
  return (
    <main className="coffee-page">
      <section className="hero-section" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">A little ritual, made well</p>
          <h1 id="hero-title">Coffee.<br /><span>On. Shot.</span></h1>
          <p className="hero-description">
            Good beans, warm light, and a reason to stay a little longer.
          </p>
          <Link className="menu-button" to="/menu">
            Explore menu <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="hero-image-wrap">
          <div className="hero-image-frame">
            <img
              src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85"
              alt="Freshly poured coffee on a cafe table"
            />
          </div>
          <p className="image-note">Slow mornings<br />start here</p>
        </div>
      </section>

      <section className="story-section" aria-labelledby="story-title">
        <div className="story-image-wrap">
          <img
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1100&q=85"
            alt="A carefully prepared cafe breakfast with fresh ingredients"
          />
          <span className="story-stamp">Since<br /><strong>2026</strong></span>
        </div>
        <div className="story-copy">
          <p className="eyebrow">The coffee shot story</p>
          <h2 id="story-title">Made for the<br /><em>in-between</em> moments.</h2>
          <p>
            Coffee Shot is a neighborhood pause: a place for the first cup,
            the last page, and every conversation that deserves more time.
            We keep the room easy, the coffee thoughtful, and the table open.
          </p>
          <div className="story-rule" aria-hidden="true" />
        </div>
      </section>

      <footer className="coffee-footer">
        <div className="footer-brand">
          <span className="footer-mark">CS</span>
          <div>
            <strong>Coffee Shot</strong>
            <span>Coffee. On. Shot.</span>
          </div>
        </div>
        <nav className="social-links" aria-label="Social media links">
          <a href="https://www.instagram.com/coffeeshot40_60/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">Facebook</a>
          <a href="https://www.youtube.com/" target="_blank" rel="noreferrer">YouTube</a>
        </nav>
        <p className="copyright">© 2026 Coffee Shot. All rights reserved.</p>
      </footer>
    </main>
  )
}

export default Hero