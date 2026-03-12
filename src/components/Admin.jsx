import { useState, useEffect } from 'react'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import AdminEstimateRequests from './AdminEstimateRequests'
import AdminProjectsManager from './AdminProjectsManager'
import AdminServicesManager from './AdminServicesManager'
import AdminReviewsManager from './AdminReviewsManager'
import { adminFetch } from '../lib/adminApi'

export default function Admin() {
  const [adminKey, setAdminKey] = useState('')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [stats, setStats] = useState({
    totalMessages: 0,
    newMessages: 0,
    totalReviews: 0,
    totalProjects: 0
  })

  const loadStats = async () => {
    try {
      const [msgs, reviews, projects] = await Promise.all([
        adminFetch('/api/admin/messages', adminKey).then(r => r.json()),
        adminFetch('/api/admin/reviews', adminKey).then(r => r.json()),
        adminFetch('/api/admin/projects', adminKey).then(r => r.json())
      ])
      setStats({
        totalMessages: msgs.length,
        newMessages: msgs.filter(m => !m.read).length,
        totalReviews: reviews.length,
        totalProjects: projects.length
      })
    } catch (e) {
      console.error('Failed to load stats:', e)
    }
  }

  useEffect(() => {
    if (adminKey) {
      loadStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey])

  const handleLogout = () => {
    setAdminKey('')
    setCurrentPage('dashboard')
  }

  if (!adminKey) {
    return <AdminLogin onLogin={setAdminKey} />
  }

  const pages = {
    dashboard: <AdminDashboard adminKey={adminKey} stats={stats} refreshStats={loadStats} />,
    estimates: <AdminEstimateRequests adminKey={adminKey} onUpdate={loadStats} />,
    projects: <AdminProjectsManager adminKey={adminKey} onUpdate={loadStats} />,
    services: <AdminServicesManager adminKey={adminKey} onUpdate={loadStats} />,
    reviews: <AdminReviewsManager adminKey={adminKey} onUpdate={loadStats} />
  }

  return (
    <div className="admin-layout">
      <style>{`
        .admin-layout {
          min-height: 100vh;
          background: #0a0e27;
          color: #fff;
          display: flex;
        }

        .admin-sidebar {
          width: 260px;
          background: #141829;
          border-right: 1px solid rgba(100,108,255,0.2);
          padding: 2rem 0;
          position: fixed;
          height: 100vh;
          overflow-y: auto;
        }

        .admin-sidebar h2 {
          padding: 0 1.5rem 2rem;
          margin: 0;
          font-size: 1.3rem;
          background: linear-gradient(135deg, #646cff, #ffd880);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .admin-nav {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 1rem;
        }

        .admin-nav button {
          padding: 0.875rem 1.25rem;
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          text-align: left;
          border-radius: 8px;
          transition: all 0.3s ease;
          font-size: 0.95rem;
          font-weight: 500;
        }

        .admin-nav button:hover {
          background: rgba(100,108,255,0.2);
          color: #ffd880;
        }

        .admin-nav button.active {
          background: rgba(100,108,255,0.3);
          color: #ffd880;
          border-left: 3px solid #ffd880;
          padding-left: 1.22rem;
        }

        .admin-logout {
          margin-top: auto;
          padding: 2rem 1rem 1rem;
          border-top: 1px solid rgba(100,108,255,0.2);
        }

        .admin-logout button {
          width: 100%;
          background: rgba(255,100,100,0.2);
          color: #ff6464;
          border: 1px solid rgba(255,100,100,0.3);
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .admin-logout button:hover {
          background: rgba(255,100,100,0.3);
          border-color: rgba(255,100,100,0.5);
        }

        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 2rem;
        }

        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(100,108,255,0.2);
        }

        .admin-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(100,108,255,0.1);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 1.5rem;
        }

        .stat-card h3 {
          margin: 0 0 0.5rem;
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .stat-card .value {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: #ffd880;
        }

        @media (max-width: 768px) {
          .admin-sidebar {
            width: 200px;
          }

          .admin-main {
            margin-left: 200px;
            padding: 1rem;
          }

          .admin-header h1 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 600px) {
          .admin-sidebar {
            position: absolute;
            width: 200px;
            z-index: 100;
            height: auto;
          }

          .admin-main {
            margin-left: 0;
            padding-top: 70px;
          }
        }
      `}</style>

      <aside className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav className="admin-nav">
          <button
            className={currentPage === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={currentPage === 'estimates' ? 'active' : ''}
            onClick={() => setCurrentPage('estimates')}
          >
            📧 Estimate Requests
          </button>
          <button
            className={currentPage === 'reviews' ? 'active' : ''}
            onClick={() => setCurrentPage('reviews')}
          >
            ⭐ Reviews
          </button>
          <button
            className={currentPage === 'projects' ? 'active' : ''}
            onClick={() => setCurrentPage('projects')}
          >
            🏗️ Projects Manager
          </button>
          <button
            className={currentPage === 'services' ? 'active' : ''}
            onClick={() => setCurrentPage('services')}
          >
            🔧 Services Manager
          </button>
        </nav>
        <div className="admin-logout">
          <button onClick={handleLogout}>← Logout</button>
        </div>
      </aside>

      <main className="admin-main">
        {pages[currentPage]}
      </main>
    </div>
  )
}
