import { useState, useEffect, useCallback } from 'react'
import { adminFetch, filesToDataUrls } from '../lib/adminApi'
import { readFileAsDataUrl, resolveAssetUrl } from '../lib/reviews'

export default function AdminProjectsManager({ adminKey, onUpdate }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: '',
    description: ''
  })
  const [images, setImages] = useState([])
  const [coverImage, setCoverImage] = useState(null)
  const [useCoverImage, setUseCoverImage] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const loadProjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/projects', adminKey)
      const data = await res.json()
      setProjects(data.reverse())
    } catch (e) {
      console.error('Failed to load projects:', e)
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    loadProjects()
  }, [adminKey, loadProjects])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
  }

  const handleCoverImageChange = (e) => {
    setCoverImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      alert('Title and description are required')
      return
    }

    setSubmitting(true)
    try {
      const uploadedImages = await filesToDataUrls(images)
      const uploadedCover = coverImage ? await readFileAsDataUrl(coverImage) : null

      const payload = {
        title: formData.title,
        location: formData.location,
        type: formData.type,
        description: formData.description,
        images: uploadedImages.length > 0 ? uploadedImages : (editing?.images || []),
        coverImage: useCoverImage
          ? (uploadedCover || editing?.coverImage || null)
          : (editing?.coverImage || uploadedImages[0] || null)
      }

      const method = editing ? 'PUT' : 'POST'
      const path = editing ? `/api/admin/projects/${editing.id}` : '/api/admin/projects'

      const res = await adminFetch(path, adminKey, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setFormData({ title: '', location: '', type: '', description: '' })
        setImages([])
        setCoverImage(null)
        setUseCoverImage(false)
        setEditing(null)
        setShowForm(false)
        loadProjects()
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to save project:', e)
      alert('Error saving project')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (project) => {
    setFormData({
      title: project.title,
      location: project.location,
      type: project.type,
      description: project.description
    })
    setImages([])
    setCoverImage(null)
    setUseCoverImage(false)
    setEditing(project)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this project? This cannot be undone.')) return

    try {
      const res = await adminFetch(`/api/admin/projects/${id}`, adminKey, {
        method: 'DELETE'
      })
      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id))
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to delete project:', e)
      alert('Error deleting project')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormData({ title: '', location: '', type: '', description: '' })
    setImages([])
    setCoverImage(null)
    setUseCoverImage(false)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div>
      <style>{`
        .projects-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(100,108,255,0.2);
        }

        .projects-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .add-project-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #646cff, #5b5aff);
          border: none;
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-project-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(100,108,255,0.3);
        }

        .project-form-container {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .form-title {
          font-size: 1.3rem;
          margin: 0 0 1.5rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: rgba(255,255,255,0.8);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(100,108,255,0.3);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group select option {
          background: #1a1f3a;
          color: #fff;
          padding: 0.5rem;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: rgba(100,108,255,0.6);
          background: rgba(100,108,255,0.1);
        }

        .form-group textarea {
          grid-column: 1 / -1;
          min-height: 120px;
          resize: vertical;
        }

        .form-group.file-input {
          grid-column: 1 / -1;
        }

        .file-input input[type="file"] {
          cursor: pointer;
        }

        .form-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          grid-column: 1 / -1;
          margin-top: 1rem;
        }

        .form-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
        }

        .form-btn.save {
          background: linear-gradient(135deg, #646cff, #5b5aff);
          color: #fff;
        }

        .form-btn.save:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(100,108,255,0.3);
        }

        .form-btn.cancel {
          background: rgba(100,108,255,0.1);
          border: 1px solid rgba(100,108,255,0.3);
          color: rgba(255,255,255,0.8);
        }

        .form-btn.cancel:hover {
          background: rgba(100,108,255,0.2);
        }

        .projects-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .project-card {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .project-image {
          width: 100%;
          height: 200px;
          background: rgba(100,108,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
          font-size: 3rem;
          object-fit: cover;
        }

        .project-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .project-info {
          padding: 1.5rem;
        }

        .project-info h3 {
          margin: 0 0 0.5rem;
          font-size: 1.1rem;
        }

        .project-meta {
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          margin: 0.25rem 0;
        }

        .project-desc {
          color: rgba(255,255,255,0.8);
          font-size: 0.9rem;
          margin-top: 0.75rem;
          line-height: 1.4;
        }

        .project-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(100,108,255,0.2);
        }

        .project-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .project-btn.edit {
          background: rgba(100,108,255,0.2);
          color: #ffd880;
        }

        .project-btn.edit:hover {
          background: rgba(100,108,255,0.3);
        }

        .project-btn.delete {
          background: rgba(255,100,100,0.1);
          color: #ff6464;
        }

        .project-btn.delete:hover {
          background: rgba(255,100,100,0.2);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(255,255,255,0.5);
        }
      `}</style>

      <div className="projects-header">
        <h1>🏗️ Projects Manager</h1>
        {!showForm && (
          <button className="add-project-btn" onClick={() => setShowForm(true)}>
            + Add Project
          </button>
        )}
      </div>

      {showForm && (
        <div className="project-form-container">
          <h2 className="form-title">{editing ? 'Edit Project' : 'New Project'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="title">Project Title *</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Hardwood Installation - Downtown Office"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Brooklyn, NY"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Flooring Type</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select type...</option>
                  <option value="Hardwood">Hardwood</option>
                  <option value="Deck">Deck</option>
                  <option value="Tile">Tile</option>
                  <option value="Vinyl">Vinyl</option>
                  <option value="Repair">Repair</option>
                  <option value="Refinishing">Refinishing</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the project details..."
                  required
                />
              </div>

              {editing && editing.albumName ? (
                <div className="form-group file-input">
                  <label>Album-Linked Project</label>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                    📁 This project is linked to album "{editing.albumName}" with {editing.imageCount || 0} images. 
                    Images are managed in the portfolio folder.
                  </p>
                </div>
              ) : (
                <>
                  <div className="form-group file-input">
                    <label htmlFor="images">📁 Gallery Images (Multiple)</label>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                    />
                    {images.length > 0 && (
                      <small>Selected: {images.length} image{images.length !== 1 ? 's' : ''}</small>
                    )}
                    {editing && editing.images && images.length === 0 && (
                      <small>Current: {editing.images.length} image{editing.images.length !== 1 ? 's' : ''}</small>
                    )}
                  </div>

                  <div className="form-group file-input" style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={useCoverImage}
                        onChange={(e) => setUseCoverImage(e.target.checked)}
                        style={{ width: 'auto' }}
                      />
                      Use custom cover image (optional)
                    </label>
                    {useCoverImage && (
                      <>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageChange}
                          style={{ marginTop: '0.75rem' }}
                        />
                        {coverImage && <small>Selected: {coverImage.name}</small>}
                        {editing && editing.coverImage && !coverImage && (
                          <small>Current cover: {editing.coverImage}</small>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}

              <div className="form-buttons">
                <button type="button" className="form-btn cancel" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="form-btn save" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Project'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <p>No projects yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="projects-list">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image">
                {project.coverImage ? (
                  <img 
                    src={resolveAssetUrl(project.coverImage)} 
                    alt={project.title} 
                  />
                ) : project.image && (project.image.startsWith('/uploads') || project.image.startsWith('/')) ? (
                  <img 
                    src={resolveAssetUrl(project.image)} 
                    alt={project.title} 
                  />
                ) : project.images && project.images.length > 0 ? (
                  <img 
                    src={resolveAssetUrl(project.images[0])} 
                    alt={project.title} 
                  />
                ) : (
                  '🖼️'
                )}
              </div>
              <div className="project-info">
                <h3>{project.title}</h3>
                {project.location && <p className="project-meta">📍 {project.location}</p>}
                {project.type && <p className="project-meta">🏗️ {project.type}</p>}
                {project.albumName && <p className="project-meta">📁 Album: {project.albumName} ({project.imageCount || 0} images)</p>}
                {project.images && project.images.length > 0 && (
                  <p className="project-meta">🖼️ Gallery: {project.images.length} image{project.images.length !== 1 ? 's' : ''}</p>
                )}
                <p className="project-meta">📅 {formatDate(project.createdAt)}</p>
                <p className="project-desc">{project.description}</p>
                <div className="project-actions">
                  <button className="project-btn edit" onClick={() => handleEdit(project)}>
                    ✎ Edit
                  </button>
                  <button className="project-btn delete" onClick={() => handleDelete(project.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
