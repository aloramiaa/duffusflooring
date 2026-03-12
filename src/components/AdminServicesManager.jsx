import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '../lib/adminApi'
import { readFileAsDataUrl, resolveAssetUrl } from '../lib/reviews'

export default function AdminServicesManager({ adminKey, onUpdate }) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })
  const [image, setImage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/services', adminKey)
      const data = await res.json()
      setServices(data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)))
    } catch (e) {
      console.error('Failed to load services:', e)
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    loadServices()
  }, [adminKey, loadServices])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.description) {
      alert('Name and description are required')
      return
    }

    setSubmitting(true)
    try {
      const imageDataUrl = image ? await readFileAsDataUrl(image) : undefined
      const payload = {
        name: formData.name,
        description: formData.description,
        image: imageDataUrl !== undefined ? imageDataUrl : editing?.image
      }

      const method = editing ? 'PUT' : 'POST'
      const path = editing ? `/api/admin/services/${editing.id}` : '/api/admin/services'

      const res = await adminFetch(path, adminKey, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setFormData({ name: '', description: '' })
        setImage(null)
        setEditing(null)
        setShowForm(false)
        loadServices()
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to save service:', e)
      alert('Error saving service')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description
    })
    setEditing(service)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this service? This cannot be undone.')) return

    try {
      const res = await adminFetch(`/api/admin/services/${id}`, adminKey, {
        method: 'DELETE'
      })
      if (res.ok) {
        setServices(services.filter(s => s.id !== id))
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to delete service:', e)
      alert('Error deleting service')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditing(null)
    setFormData({ name: '', description: '' })
    setImage(null)
  }

  return (
    <div>
      <style>{`
        .services-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(100,108,255,0.2);
        }

        .services-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .add-service-btn {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #646cff, #5b5aff);
          border: none;
          color: #fff;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .add-service-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(100,108,255,0.3);
        }

        .service-form-container {
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

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .form-group label {
          color: rgba(255,255,255,0.8);
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(100,108,255,0.3);
          border-radius: 8px;
          color: #fff;
          font-size: 0.95rem;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: rgba(100,108,255,0.6);
          background: rgba(100,108,255,0.1);
        }

        .form-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .form-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
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

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .service-card {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 2rem;
        }

        .service-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .service-card h3 {
          margin: 0 0 0.75rem;
          font-size: 1.1rem;
        }

        .service-desc {
          color: rgba(255,255,255,0.8);
          font-size: 0.95rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .service-image {
          width: 100%;
          height: 150px;
          background: rgba(100,108,255,0.1);
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .service-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .service-actions {
          display: flex;
          gap: 0.75rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(100,108,255,0.2);
        }

        .service-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .service-btn.edit {
          background: rgba(100,108,255,0.2);
          color: #ffd880;
        }

        .service-btn.edit:hover {
          background: rgba(100,108,255,0.3);
        }

        .service-btn.delete {
          background: rgba(255,100,100,0.1);
          color: #ff6464;
        }

        .service-btn.delete:hover {
          background: rgba(255,100,100,0.2);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(255,255,255,0.5);
        }
      `}</style>

      <div className="services-header">
        <h1>🔧 Services Manager</h1>
        {!showForm && (
          <button className="add-service-btn" onClick={() => setShowForm(true)}>
            + Add Service
          </button>
        )}
      </div>

      {showForm && (
        <div className="service-form-container">
          <h2 className="form-title">{editing ? 'Edit Service' : 'New Service'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Service Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Hardwood Flooring Installation"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe this service..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Service Image</label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {image && <small>Selected: {image.name}</small>}
              {editing && editing.image && !image && (
                <small>Current: {editing.image}</small>
              )}
            </div>

            <div className="form-buttons">
              <button type="button" className="form-btn cancel" onClick={handleCancel} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="form-btn save" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading services...</div>
      ) : services.length === 0 ? (
        <div className="empty-state">
          <p>No services configured.</p>
        </div>
      ) : (
        <div className="services-grid">
          {services.map(service => (
            <div key={service.id} className="service-card">
              {service.image && (
                <div className="service-image">
                  <img src={resolveAssetUrl(service.image)} alt={service.name} />
                </div>
              )}
              <h3>{service.name}</h3>
              <p className="service-desc">{service.description}</p>
              <div className="service-actions">
                <button className="service-btn edit" onClick={() => handleEdit(service)}>
                  ✎ Edit
                </button>
                <button className="service-btn delete" onClick={() => handleDelete(service.id)}>
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
