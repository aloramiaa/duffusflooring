import { useState, useEffect } from 'react'

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  // Fallback services if API fails
  const defaultServices = [
    {
      id: 'hardwood',
      name: 'Hardwood Installation & Refinishing',
      description: 'Premium hardwood flooring installed and refinished with precision to enhance durability and natural beauty.',
      bullets: [
        'Solid and engineered hardwood installation',
        'Sanding and refinishing',
        'Custom stain and finish options',
        'Board replacement and repairs'
      ]
    },
    {
      id: 'vinyl',
      name: 'Luxury Vinyl Tile (LVT) & Luxury Vinyl Plank (LVP)',
      description: 'Durable, water-resistant flooring solutions that replicate natural wood while offering easy maintenance.',
      bullets: [
        'Professional LVT & LVP installation',
        'Residential and commercial applications',
        'Modern, low-maintenance finishes',
        'Repair and replacement services'
      ]
    },
    {
      id: 'tile',
      name: 'Tile Installation',
      description: 'Coordinated tile installations completed by trusted trade professionals to meet high workmanship standards.',
      bullets: [
        'Floor tile installation',
        'Bathroom tile flooring',
        'Entryways and high-traffic areas'
      ]
    },
    {
      id: 'commercial',
      name: 'Commercial Flooring Solutions',
      description: 'Reliable flooring systems designed to withstand heavy use while maintaining a clean, professional appearance.',
      bullets: [
        'Office and retail installations',
        'Rental property flooring',
        'Multi-unit developments',
        'Durable, high-traffic materials'
      ]
    },
    {
      id: 'repairs',
      name: 'Subfloor Preparation, Leveling & Repairs',
      description: 'A strong foundation ensures long-term performance — we prepare and inspect every surface before installation.',
      bullets: [
        'Subfloor inspection and preparation',
        'Surface leveling',
        'Structural repairs',
        'Maintenance solutions'
      ]
    }
  ]

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => {
        // Parse bullets if stored as JSON string
        const parsedServices = data.map(s => {
          if (s.description && s.description.includes('Includes ')) {
            const parts = s.description.split('Includes ')
            const desc = parts[0].trim()
            const bullets = parts[1] ? parts[1].split(', ').map(b => b.trim()) : []
            return { ...s, description: desc, bullets }
          }
          return { ...s, bullets: [] }
        })
        setServices(parsedServices.length > 0 ? parsedServices : defaultServices)
      })
      .catch(() => {
        setServices(defaultServices)
      })
      .finally(() => {
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <main>
        <section className="section-padding container">
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>Loading services...</div>
        </section>
      </main>
    )
  }

  return (
    <main>
      {/* hero intro removed per request */}

      <section className="section-padding container services-section" data-aos="fade-up">
        <h2 className="section-title" data-aos="fade-up">Our Services</h2>
        <div className="services-grid">
          {services.map((s, idx) => (
            <article key={s.id} className="service-card" tabIndex={0} data-aos="fade-up" data-aos-delay={100 + idx * 80}>
              <div className="card-icon" aria-hidden>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M6 12h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
              <h3>{s.name || s.title}</h3>
              <p className="tight">{s.description || s.desc}</p>
              {s.bullets && s.bullets.length > 0 && (
                <ul>
                  {s.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              )}
              {/* removed action button per request */}
            </article>
          ))}
        </div>
      </section>

      <section className="section-padding container why-process-grid">
        <article className="info-card why-card">
          <h2 className="section-title">Why Choose Duffus Flooring</h2>
          <div className="mini-cards">
            {[
              '25+ Years of Industry Experience',
              'Attention to Detail on Every Project',
              'Honest Pricing and Clear Communication',
              'Professionally Coordinated Installations',
              'Reliable Completion Timelines'
            ].map((text, i) => (
              <div key={i} className="mini-card">
                <span className="mini-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mini-text">{text}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="info-card process-card">
          <h2 className="section-title">Our Process</h2>
          <div className="mini-cards">
            {[
              'Consultation & Site Assessment',
              'Material Selection Guidance',
              'Professional Installation',
              'Final Inspection & Walkthrough'
            ].map((text, i) => (
              <div key={i} className="mini-card">
                <span className="mini-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="mini-text">{text}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="section-padding container cta-section">
        <h2 className="section-title">Ready to Upgrade Your Floors?</h2>
        <p className="tight">Contact Duffus Flooring today to discuss your project and receive professional guidance backed by decades of hands-on experience.</p>
        <a href="#contact" className="btn btn-primary large-cta">Contact Us</a>
      </section>
    </main>
  )
}
