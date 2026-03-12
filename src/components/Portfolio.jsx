import { useEffect, useState } from 'react'

export default function Portfolio() {
  const [manifest, setManifest] = useState(null)
  const [projects, setProjects] = useState([])
  const [album, setAlbum] = useState(null)
  const [galleryProject, setGalleryProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const titleCase = (s) => s ? s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : s

  const inferType = (albumName) => {
    const lower = albumName.toLowerCase()
    if (lower.includes('vinyl')) return 'Vinyl'
    if (lower.includes('deck')) return 'Deck'
    if (lower.includes('stair')) return 'Hardwood'
    if (lower.includes('hardwood')) return 'Hardwood'
    return 'Project'
  }

  const toPublicAssetUrl = (value) => {
    if (!value) return null
    if (/^https?:\/\//i.test(value)) return value
    const normalized = String(value).replace(/^\.?\//, '')
    return `/${encodeURI(normalized)}`
  }

  const deriveProjectsFromManifest = (manifestData) => {
    const albums = manifestData?.albums || {}
    return Object.entries(albums).map(([albumName, files], idx) => {
      const items = Array.isArray(files) ? files : []
      const firstImage = items.find((item) => {
        const lower = item.toLowerCase()
        return !(lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg'))
      })

      return {
        id: albumName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `album-${idx}`,
        title: titleCase(albumName),
        type: inferType(albumName),
        description: `${titleCase(albumName)} project showcase.`,
        albumName,
        imageCount: items.length,
        images: items,
        coverImage: firstImage ? toPublicAssetUrl(firstImage) : '/hero.jpg'
      }
    })
  }



  useEffect(() => {
    Promise.allSettled([
      fetch('/portfolio-manifest.json').then((r) => (r.ok ? r.json() : { albums: {} })),
      fetch('/api/projects').then((r) => (r.ok ? r.json() : []))
    ])
      .then(([manifestResult, projectsResult]) => {
        const m = manifestResult.status === 'fulfilled' ? manifestResult.value : { albums: {} }
        const apiProjects = projectsResult.status === 'fulfilled' && Array.isArray(projectsResult.value)
          ? projectsResult.value
          : []
        const staticProjects = deriveProjectsFromManifest(m)

        setManifest(m)
        setProjects(apiProjects.length > 0 ? apiProjects : staticProjects)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setManifest({ albums: {} })
        setProjects([])
        setLoading(false)
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash.replace('#', '') || 'portfolio'
      const parts = hash.split('/')
      if (parts[0] === 'portfolio' && parts[1]) {
        const param = decodeURIComponent(parts.slice(1).join('/'))
        // Check if it's a project ID (gallery project)
        const proj = projects.find(p => p.id === param)
        if (proj && proj.images && proj.images.length > 0) {
          setGalleryProject(proj)
          setAlbum(null)
        } else {
          // Otherwise treat as album name
          setAlbum(param)
          setGalleryProject(null)
        }
      } else {
        setAlbum(null)
        setGalleryProject(null)
      }
    }
    window.addEventListener('hashchange', onHash)
    onHash()
    return () => window.removeEventListener('hashchange', onHash)
  }, [projects])

  const SkeletonCard = () => (
    <div className="portfolio-skeleton">
      <div className="skeleton-image"></div>
      <div className="skeleton-overlay">
        <div className="skeleton-text"></div>
        <div className="skeleton-text" style={{ width: '60%' }}></div>
      </div>
    </div>
  )

  return (
    <section className="portfolio-section" data-aos="fade-up">
      <style>{`
        .portfolio-section {
          padding: 4rem 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .portfolio-hero {
          text-align: center;
          margin-bottom: 4rem;
          animation: slideDown 0.6s ease-out;
        }

        .portfolio-hero h2 {
          font-size: 3rem;
          margin: 0 0 1rem;
          background: linear-gradient(135deg, #646cff, #ffd880);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
        }

        .portfolio-hero .lead {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.8);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .albums-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .album-card-wrapper {
          animation: scaleIn 0.5s ease-out both;
        }

        .album-card {
          position: relative;
          display: block;
          height: 300px;
          border-radius: 16px;
          overflow: hidden;
          cursor: pointer;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          group: "album";
        }

        .album-card:hover {
          transform: translateY(-12px);
          box-shadow: 0 20px 40px rgba(100,108,255,0.25);
        }

        .album-card img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .album-card:hover img {
          transform: scale(1.08);
          filter: brightness(0.7);
        }

        .album-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(to bottom, transparent, rgba(0,0,0,0.8));
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .album-card:hover .album-overlay {
          background: linear-gradient(to bottom, rgba(100,108,255,0.2), rgba(0,0,0,0.9));
        }

        .album-overlay h3 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          color: #fff;
        }

        .album-overlay .count {
          color: #ffd880;
          font-size: 0.9rem;
          margin: 0;
          opacity: 0.9;
        }

        .project-type-badge {
          display: inline-block;
          background: rgba(100,108,255,0.4);
          color: #646cff;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          margin: 0.5rem 0;
        }

        .project-location {
          color: rgba(255,255,255,0.8);
          font-size: 0.85rem;
          margin: 0.25rem 0;
        }

        .project-desc {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          margin: 0.5rem 0 0;
          line-height: 1.4;
        }

        .portfolio-skeleton {
          height: 300px;
          background: rgba(100,108,255,0.1);
          border-radius: 16px;
          overflow: hidden;
          position: relative;
        }

        .skeleton-image {
          width: 100%;
          height: 70%;
          background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1));
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .skeleton-overlay {
          padding: 1rem;
          height: 30%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 0.5rem;
        }

        .skeleton-text {
          height: 12px;
          background: linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.2), rgba(255,255,255,0.1));
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
          border-radius: 4px;
          width: 80%;
        }

        .gallery-view {
          animation: fadeIn 0.4s ease-out;
        }

        .gallery-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .gallery-header h3 {
          margin: 0;
          font-size: 2rem;
        }

        .gallery-header .count {
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
        }

        .back-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(100,108,255,0.2);
          border: 1px solid rgba(100,108,255,0.5);
          color: #ffd880;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          font-size: 0.95rem;
        }

        .back-btn:hover {
          background: rgba(100,108,255,0.35);
          border-color: rgba(100,108,255,0.8);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 1rem;
        }

        .gallery-item {
          position: relative;
          padding-bottom: 100%;
          border-radius: 8px;
          overflow: hidden;
          background: rgba(100,108,255,0.1);
          cursor: pointer;
          transition: transform 0.3s ease;
          animation: fadeInUp 0.5s ease-out backwards;
        }

        .gallery-item:hover {
          transform: translateY(-8px);
        }

        .gallery-item img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease, filter 0.3s ease;
        }

        .gallery-item video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gallery-item:hover img {
          transform: scale(1.05);
          filter: brightness(0.9);
        }

        .gallery-caption {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(255,216,128,0.9);
          color: #000;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
          z-index: 1;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: rgba(255,255,255,0.6);
        }

        .empty-state-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .projects-section {
          margin-top: 4rem;
          padding-top: 3rem;
          border-top: 1px solid rgba(100,108,255,0.2);
        }

        .section-title-small {
          font-size: 2rem;
          text-align: center;
          margin-bottom: 2.5rem;
          background: linear-gradient(135deg, #646cff, #ffd880);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }

        .project-card {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .project-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(100,108,255,0.3);
        }

        .project-image {
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: rgba(0,0,0,0.2);
        }

        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .project-card:hover .project-image img {
          transform: scale(1.05);
        }

        .project-content {
          padding: 1.5rem;
        }

        .project-content h4 {
          margin: 0 0 0.75rem;
          font-size: 1.3rem;
          color: #ffd880;
        }

        .project-badge {
          display: inline-block;
          background: rgba(100,108,255,0.3);
          color: #646cff;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.75rem;
        }

        .project-location {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          margin: 0.5rem 0;
        }

        .project-description {
          color: rgba(255,255,255,0.8);
          line-height: 1.6;
          margin: 0.75rem 0 0;
        }

        @media (max-width: 768px) {
          .portfolio-hero h2 {
            font-size: 2rem;
          }

          .albums-container {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 1.5rem;
          }

          .album-card {
            height: 220px;
          }

          .gallery-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 0.75rem;
          }

          .projects-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .section-title-small {
            font-size: 1.5rem;
          }
        }
      `}</style>

      <div className="portfolio-hero">
        <h2 data-aos="fade-up">Portfolio</h2>
        <p className="lead" data-aos="fade-up">Explore our collection of completed projects</p>
      </div>

      {loading && (
        <div className="albums-container">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {!loading && !album && !galleryProject && (
        <>
          {error && (
            <div className="empty-state">
              <div className="empty-state-icon">⚠️</div>
              <p>Unable to load portfolio at this time</p>
            </div>
          )}
          {!error && projects.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📁</div>
              <p>No projects available yet</p>
            </div>
          )}
          {!error && projects.length > 0 && (
            <div className="albums-container">
              {projects.map((project, i) => {
                // Determine display image and count
                const thumb = project.coverImage
                  ? toPublicAssetUrl(project.coverImage)
                  : project.image && (project.image.startsWith('/uploads') || project.image.startsWith('/'))
                    ? toPublicAssetUrl(project.image)
                    : project.images && project.images.length > 0
                      ? toPublicAssetUrl(project.images[0])
                      : '/hero.jpg'
                const count = project.albumName ? project.imageCount : (project.images ? project.images.length : 1)
                
                // Determine if this is clickable (has images/album)
                const isClickable = project.albumName || (project.images && project.images.length > 0)
                const linkHref = project.albumName ? `#portfolio/${encodeURIComponent(project.albumName)}` : `#portfolio/${project.id}`
                
                return (
                  <div key={project.id} className="album-card-wrapper" style={{ animationDelay: `${i * 0.1}s` }}>
                    {isClickable ? (
                      <a
                        href={linkHref}
                        className="album-card"
                        aria-label={`Open ${project.title} with ${count} items`}
                      >
                        <img src={thumb} alt={project.title} onError={(e) => { e.target.src = '/hero.jpg' }} />
                        <div className="album-overlay">
                          <h3>{project.title}</h3>
                          {project.type && <span className="project-type-badge">{project.type}</span>}
                          <p className="count">{count} {count === 1 ? 'item' : 'items'}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="album-card">
                        <img src={thumb} alt={project.title} onError={(e) => { e.target.src = '/hero.jpg' }} />
                        <div className="album-overlay">
                          <h3>{project.title}</h3>
                          {project.type && <span className="project-type-badge">{project.type}</span>}
                          {project.location && <p className="project-location">📍 {project.location}</p>}
                          <p className="project-desc">{project.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {!loading && album && manifest.albums[album] && (
        <div className="gallery-view">
          <div className="gallery-header">
            <div>
              <h3>{titleCase(album)}</h3>
              <div className="count">{manifest.albums[album].length} items</div>
            </div>
            <button
              className="back-btn"
              onClick={() => window.location.hash = '#portfolio'}
              aria-label="Back to all albums"
            >
              ← Back to Albums
            </button>
          </div>

          <div className="gallery-grid">
            {manifest.albums[album].map((file, i) => {
              const lower = file.toLowerCase()
              const name = file.split('/').pop().replace(/[-_]/g, ' ')
              const isVideo = lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.ogg')

              return (
                <div
                  key={file}
                  className="gallery-item"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src: encodeURI(`/${file}`), alt: name } }))
                    }
                  }}
                >
                  {isVideo ? (
                    <>
                      <video controls onError={(e) => { e.target.style.display = 'none' }}>
                        <source src={encodeURI(`/${file}`)} />
                      </video>
                      <div className="gallery-caption">Video</div>
                    </>
                  ) : (
                    <img
                      src={encodeURI(`/${file}`)}
                      alt={name}
                      onClick={() => window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src: encodeURI(`/${file}`), alt: name } }))}
                      onError={(e) => { e.target.src = '/hero.jpg' }}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {!loading && galleryProject && galleryProject.images && galleryProject.images.length > 0 && (
        <div className="gallery-view">
          <div className="gallery-header">
            <div>
              <h3>{galleryProject.title}</h3>
              <div className="count">{galleryProject.images.length} items</div>
            </div>
            <button
              className="back-btn"
              onClick={() => window.location.hash = '#portfolio'}
              aria-label="Back to all projects"
            >
              ← Back to Projects
            </button>
          </div>

          <div className="gallery-grid">
            {galleryProject.images.map((imageUrl, i) => {
              const name = imageUrl.split('/').pop().replace(/[-_]/g, ' ')
              const fullUrl = toPublicAssetUrl(imageUrl)

              return (
                <div
                  key={imageUrl}
                  className="gallery-item"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src: fullUrl, alt: name } }))
                    }
                  }}
                >
                  <img
                    src={fullUrl}
                    alt={name}
                    onClick={() => window.dispatchEvent(new CustomEvent('open-lightbox', { detail: { src: fullUrl, alt: name } }))}
                    onError={(e) => { e.target.src = '/hero.jpg' }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}
