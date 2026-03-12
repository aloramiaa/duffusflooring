import { useState, useEffect } from 'react'
import { adminFetch } from '../lib/adminApi'

export default function AdminDashboard({ adminKey, stats, refreshStats }) {
  const [messages, setMessages] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey])

  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const [msgs, proj] = await Promise.all([
        adminFetch('/api/admin/messages', adminKey).then(r => r.json()),
        adminFetch('/api/admin/projects', adminKey).then(r => r.json())
      ])
      setMessages(msgs.reverse().slice(0, 5))
      setProjects(proj.reverse().slice(0, 5))
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div>
      <style>{`
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .dashboard-stat {
          background: linear-gradient(135deg, rgba(100,108,255,0.1), rgba(100,108,255,0.05));
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .dashboard-stat h3 {
          margin: 0 0 1rem;
          color: rgba(255,255,255,0.6);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .dashboard-stat .stat-value {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffd880;
          margin: 0;
        }

        .dashboard-section {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .dashboard-section h2 {
          margin: 0 0 1.5rem;
          font-size: 1.3rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .recent-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .recent-item {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(100,108,255,0.1);
          border-radius: 8px;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .recent-item-content {
          flex: 1;
        }

        .recent-item h4 {
          margin: 0 0 0.25rem;
          font-size: 0.95rem;
        }

        .recent-item-meta {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin: 0;
        }

        .recent-item-badge {
          background: rgba(100,108,255,0.2);
          color: #ffd880;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: rgba(255,255,255,0.5);
        }

        .dashboard-refresh {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: rgba(100,108,255,0.2);
          border: 1px solid rgba(100,108,255,0.5);
          color: #ffd880;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .dashboard-refresh:hover {
          background: rgba(100,108,255,0.3);
        }
      `}</style>

      <div className="admin-header">
        <h1>Dashboard</h1>
        <button className="dashboard-refresh" onClick={refreshStats}>
          ⟲ Refresh
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <h3>New Messages</h3>
          <p className="stat-value">{stats.newMessages}</p>
        </div>
        <div className="dashboard-stat">
          <h3>Total Messages</h3>
          <p className="stat-value">{stats.totalMessages}</p>
        </div>
        <div className="dashboard-stat">
          <h3>Total Reviews</h3>
          <p className="stat-value">{stats.totalReviews}</p>
        </div>
        <div className="dashboard-stat">
          <h3>Total Projects</h3>
          <p className="stat-value">{stats.totalProjects}</p>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>📧 Recent Messages</h2>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">No messages yet</div>
        ) : (
          <div className="recent-list">
            {messages.map(msg => (
              <div key={msg.id} className="recent-item">
                <div className="recent-item-content">
                  <h4>{msg.name}</h4>
                  <p className="recent-item-meta">{msg.email}</p>
                  <p className="recent-item-meta">{msg.message.substring(0, 60)}...</p>
                  <p className="recent-item-meta">{formatDate(msg.createdAt)}</p>
                </div>
                <span className={`recent-item-badge ${msg.read ? 'read' : 'unread'}`}>
                  {msg.read ? 'Read' : 'New'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>🏗️ Recent Projects</h2>
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="empty-state">No projects yet</div>
        ) : (
          <div className="recent-list">
            {projects.map(proj => (
              <div key={proj.id} className="recent-item">
                <div className="recent-item-content">
                  <h4>{proj.title}</h4>
                  <p className="recent-item-meta">{proj.location || 'No location'}</p>
                  <p className="recent-item-meta">{proj.type || 'No type specified'}</p>
                  <p className="recent-item-meta">{formatDate(proj.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
