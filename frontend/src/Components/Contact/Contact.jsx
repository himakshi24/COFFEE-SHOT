import React from 'react'
import './Contact.css'

const mainAddress = '44H7+QRV, Sakkardara Police Chowki Rd, Anand Nagar, Azamshah Layout, Nagpur, Maharashtra 440024'
const mapUrl = 'https://www.google.com/maps/place/Cafe+40%2F60+Sakkardara+%7C+Nagpur/@21.1304747,79.1155645,21z/data=!4m15!1m8!3m7!1s0x3bd4c754655204b7:0xb77781e2e07f54f0!2sSakkardara+Police+Chowki+Rd,+Azamshah+Layout,+Nagpur,+Maharashtra+440024!3b1!8m2!3d21.129664!4d79.1147598!16s%2Fg%2F11bw886wbf!3m5!1s0x3bd4c79d28a46a1f:0xe3566ca69d500df1!8m2!3d21.1305092!4d79.1156953!16s%2Fg%2F11m6phj3sr?entry=ttu&g_ep=EgoyMDI2MDkwMi4wIKXMDSoASAFQAw%3D%3D'

const Contact = () => {
  return (
    <main className="contact-page">
      <section className="contact-hero" aria-labelledby="contact-title">
        <div>
          
          <p className="contact-eyebrow">Come say hello</p>
          <h1 id="contact-title">Find your<br /><em>coffee corner.</em></h1>
          <p className="contact-intro">
            Questions, collaborations, or simply looking for your next table?
            We would love to hear from you.
          </p>
        </div>
        <div className="contact-hero-note" aria-hidden="true">
          <span>CS</span>
          <p>Coffee<br />on. shot.</p>
        </div>
      </section>

      <section className="contact-grid" aria-label="Coffee Shot contact details">
        <article className="contact-card contact-location-card">
          <span className="contact-card-number">01</span>
          <p className="contact-card-label">Main location</p>
          <h2>Visit the<br /><em>first table.</em></h2>
          <address>{mainAddress}</address>
          <a className="contact-map-link" href={mapUrl} target="_blank" rel="noreferrer">
            Open in Google Maps <span aria-hidden="true">↗</span>
          </a>
        </article>

        <article className="contact-card contact-details-card">
          <span className="contact-card-number">02</span>
          <p className="contact-card-label">Cafe holder contact</p>
          <div className="contact-detail-row">
            <span>Phone</span>
            <span>+91 7887824028</span>
          </div>
          <div className="contact-detail-row">
            <span>Email</span>
            <span>pjadhavjadhav9@gmail.com</span>
          </div>
          <div className="contact-detail-row">
            <span>Opening hours</span>
            <span>Monday - Sunday<br />08:00 AM to 11:00 PM</span>
          </div>
        </article>
      </section>

      <div className="contact-franchise-banner" aria-label="Franchise opportunity">
        <div className="contact-ad-brief">
          <p>We are open to add more new franchise partners and grow the Coffee Shot experience in new neighborhoods.</p>
          <a href="mailto:pjadhavjadhav9@gmail.com" className="contact-get-in-touch">Get in touch</a>
        </div>
      </div>
    </main>
  )
}

export default Contact