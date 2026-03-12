import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '../css/style.css'
import App from './App.jsx'

// Initialize AOS if loaded via CDN in index.html
if (typeof window !== 'undefined' && window.AOS) {
  window.AOS.init({ once: true, duration: 800 })
}

// Lightweight IntersectionObserver to animate [data-aos] elements
if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const el = entry.target
      if (entry.isIntersecting) {
        const delay = el.getAttribute('data-aos-delay')
        if (delay) el.style.transitionDelay = `${delay}ms`
        el.classList.add('aos-animate')
        io.unobserve(el)
      }
    })
  }, { threshold: 0.12 })

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-aos]').forEach(el => io.observe(el))
  })
}

// Ensure navigation and internal link clicks start the viewport at the top
if (typeof window !== 'undefined') {
  // On history navigation or explicit hash changes, scroll to top (except hash anchors handled separately)
  window.addEventListener('popstate', () => window.scrollTo({ top: 0, left: 0 }))
  window.addEventListener('hashchange', () => {
    // If the new hash is empty or points to the root 'portfolio' route, scroll to top
    const hash = window.location.hash || ''
    if (!hash || hash === '#portfolio') window.scrollTo({ top: 0, left: 0 })
  })

  // Intercept clicks on internal navigation links and ensure the page starts at top after navigation.
  document.addEventListener('click', (ev) => {
    const a = ev.target.closest && ev.target.closest('a')
    if (!a || !a.getAttribute) return
    const href = a.getAttribute('href')
    if (!href) return

    // Ignore external links and same-page hash anchors
    if (/^https?:\/\//i.test(href) && !href.includes(window.location.origin)) return
    if (href.startsWith('#')) return

    // For internal full-page navigations (e.g., "/contact"), ensure scroll to top after navigation.
    // Allow the default navigation to proceed, then scroll to top on the next tick.
    setTimeout(() => window.scrollTo({ top: 0, left: 0 }), 50)
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
