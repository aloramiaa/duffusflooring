import { useState, useEffect } from 'react'
import { adminFetch } from '../lib/adminApi'

export default function AdminEstimateRequests({ adminKey, onUpdate }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)

  useEffect(() => {
    loadMessages()
  }, [adminKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadMessages = async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/messages', adminKey)
      const data = await res.json()
      setMessages(data.reverse())
    } catch (e) {
      console.error('Failed to load messages:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await adminFetch(`/api/admin/messages/${id}`, adminKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      if (res.ok) {
        const updated = messages.map(m => m.id === id ? { ...m, status } : m)
        setMessages(updated)
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to update status:', e)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return
    try {
      const res = await adminFetch(`/api/admin/messages/${id}`, adminKey, {
        method: 'DELETE'
      })
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id))
        setSelectedMessage(null)
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to delete message:', e)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'New': return 'status-new'
      case 'Contacted': return 'status-contacted'
      case 'Completed': return 'status-completed'
      default: return 'status-new'
    }
  }

  const filteredMessages = filter === 'new' ? messages.filter(m => m.status === 'New') : messages

  return (
    <div>
      <style>{`
        .estimates-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(100,108,255,0.2);
        }

        .estimates-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .filter-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: rgba(100,108,255,0.1);
          border: 1px solid rgba(100,108,255,0.3);
          color: rgba(255,255,255,0.7);
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .filter-btn:hover,
        .filter-btn.active {
          background: rgba(100,108,255,0.3);
          color: #ffd880;
          border-color: rgba(100,108,255,0.6);
        }

        .messages-table-container {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          overflow: hidden;
        }

        .messages-table {
          width: 100%;
          border-collapse: collapse;
        }

        .messages-table thead {
          background: rgba(100,108,255,0.1);
        }

        .messages-table th {
          padding: 1rem;
          text-align: left;
          color: rgba(255,255,255,0.7);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
          border-bottom: 1px solid rgba(100,108,255,0.3);
        }

        .messages-table td {
          padding: 1rem;
          color: rgba(255,255,255,0.9);
          border-bottom: 1px solid rgba(100,108,255,0.1);
        }

        .messages-table tbody tr {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .messages-table tbody tr:hover {
          background: rgba(100,108,255,0.08);
        }

        .messages-table tbody tr.selected {
          background: rgba(100,108,255,0.15);
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-new {
          background: rgba(255,216,128,0.2);
          color: #ffd880;
        }

        .status-contacted {
          background: rgba(100,108,255,0.2);
          color: #646cff;
        }

        .status-completed {
          background: rgba(52, 211, 153, 0.2);
          color: #34d399;
        }

        .message-detail {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 2rem;
          margin-top: 2rem;
        }

        .message-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid rgba(100,108,255,0.2);
        }

        .message-detail-header h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #ffd880;
        }

        .detail-actions {
          display: flex;
          gap: 0.75rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
        }

        .detail-label {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .detail-value {
          color: #fff;
          font-size: 1rem;
        }

        .message-body-detail {
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
          padding: 1.5rem;
          line-height: 1.6;
          color: rgba(255,255,255,0.9);
          margin-bottom: 2rem;
        }

        .status-select {
          padding: 0.5rem 1rem;
          background: rgba(100,108,255,0.1);
          border: 1px solid rgba(100,108,255,0.3);
          border-radius: 6px;
          color: #fff;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .status-select option {
          background: #1a1f3a;
          color: #fff;
        }

        .action-btn {
          padding: 0.6rem 1.25rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          white-space: nowrap;
        }

        .btn-delete {
          background: rgba(255,100,100,0.1);
          color: #ff6464;
          border: 1px solid rgba(255,100,100,0.2);
        }

        .btn-delete:hover {
          background: rgba(255,100,100,0.2);
        }

        .btn-close {
          background: rgba(100,108,255,0.2);
          color: #ffd880;
          border: 1px solid rgba(100,108,255,0.4);
        }

        .btn-close:hover {
          background: rgba(100,108,255,0.3);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(255,255,255,0.5);
        }

        @media (max-width: 768px) {
          .messages-table-container {
            overflow-x: auto;
          }

          .messages-table {
            min-width: 600px;
          }

          .detail-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="estimates-header">
        <h1>📧 Contact Submissions</h1>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({messages.length})
          </button>
          <button
            className={`filter-btn ${filter === 'new' ? 'active' : ''}`}
            onClick={() => setFilter('new')}
          >
            New ({messages.filter(m => m.status === 'New').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading messages...</div>
      ) : filteredMessages.length === 0 ? (
        <div className="empty-state">
          <p>No messages yet</p>
        </div>
      ) : (
        <>
          <div className="messages-table-container">
            <table className="messages-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMessages.map(msg => (
                  <tr
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={selectedMessage?.id === msg.id ? 'selected' : ''}
                  >
                    <td>{msg.name}</td>
                    <td>{msg.service || '-'}</td>
                    <td>{msg.phone || '-'}</td>
                    <td>{msg.email}</td>
                    <td>{formatDate(msg.createdAt)}</td>
                    <td>
                      <span className={`status-badge ${getStatusBadgeClass(msg.status || 'New')}`}>
                        {msg.status || 'New'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {selectedMessage && (
            <div className="message-detail">
              <div className="message-detail-header">
                <h3>Message Details</h3>
                <div className="detail-actions">
                  <button className="action-btn btn-close" onClick={() => setSelectedMessage(null)}>
                    ✕ Close
                  </button>
                  <button className="action-btn btn-delete" onClick={() => handleDelete(selectedMessage.id)}>
                    🗑 Delete
                  </button>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Customer Name</span>
                  <span className="detail-value">{selectedMessage.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{selectedMessage.email}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <span className="detail-value">{selectedMessage.phone || 'Not provided'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Service Needed</span>
                  <span className="detail-value">{selectedMessage.service || 'Not specified'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date Submitted</span>
                  <span className="detail-value">{formatDate(selectedMessage.createdAt)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <select
                    className="status-select"
                    value={selectedMessage.status || 'New'}
                    onChange={(e) => {
                      handleStatusChange(selectedMessage.id, e.target.value)
                      setSelectedMessage({ ...selectedMessage, status: e.target.value })
                    }}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="message-body-detail">
                <div className="detail-label" style={{ marginBottom: '1rem' }}>Message</div>
                <div>{selectedMessage.message}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
