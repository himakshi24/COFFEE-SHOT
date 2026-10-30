import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './LoginSignup.css'

const API_URL = 'http://localhost:5000/api'

const LoginSignup = () => {
  const navigate = useNavigate()
  const [isSignup, setIsSignup] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (isSignup && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const endpoint = isSignup ? `${API_URL}/users/register` : `${API_URL}/users/login`
      const payload = isSignup
        ? {
            name: formData.name,
            email: formData.email,
            password: formData.password,
          }
        : {
            email: formData.email,
            password: formData.password,
          }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed.')
      }

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
      }

      navigate('/')
    } catch (err) {
      window.alert(err.message || 'Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-intro">
          <Link className="auth-back-link" to="/">← Back to home</Link>
          <p className="auth-eyebrow">Welcome to Coffee Shot</p>
          <h1 id="auth-title">{isSignup ? 'Join the table.' : 'Welcome back.'}</h1>
          <p className="auth-description">
            {isSignup
              ? 'Create your account and keep your coffee moments close.'
              : 'Sign in for your next good cup and a little more.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {isSignup && (
            <label>
              Create username
              <input
                type="text"
                name="name"
                placeholder="Your username"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          )}

          <label>
            Enter email ID
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            {isSignup ? 'Create password' : 'Enter password'}
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </label>

          {isSignup && (
            <label>
              Re-enter password
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : isSignup ? 'Sign up' : 'Login'} <span aria-hidden="true">↗</span>
          </button>

          {!isSignup && (
            <button className="auth-text-link" type="button">Forget password?</button>
          )}

          <p className="auth-switch">
            {isSignup ? 'Already have an account?' : 'New to Coffee Shot?'}{' '}
            <button type="button" onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? 'Login' : 'Sign up'}
            </button>
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginSignup
