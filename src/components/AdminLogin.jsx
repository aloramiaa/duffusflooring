import { useState } from 'react'
import { isLocalHost, parseApiError, resolveApiPath } from '../lib/api'

export default function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState(() => (isLocalHost() ? 'emberveil' : ''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(resolveApiPath(`/api/admin/messages?key=${encodeURIComponent(password)}`))
      if (res.ok) {
        onLogin(password)
      } else {
        setError(await parseApiError(res, 'Invalid admin key'))
      }
    } catch {
      setError('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <style>{`
        .admin-login {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .login-container {
          background: rgba(20,24,41,0.95);
          border: 1px solid rgba(100,108,255,0.3);
          border-radius: 16px;
          padding: 3rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.5);
        }

        .login-container h1 {
          text-align: center;
          margin: 0 0 0.5rem;
          background: linear-gradient(135deg, #646cff, #ffd880);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-size: 2rem;
        }

        .login-subtitle {
          text-align: center;
          color: rgba(255,255,255,0.6);
          margin: 0 0 2rem;
          font-size: 0.95rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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

        .form-group input {
          padding: 0.75rem;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(100,108,255,0.3);
          border-radius: 8px;
          color: #fff;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: rgba(100,108,255,0.6);
          background: rgba(100,108,255,0.1);
        }

        .login-error {
          background: rgba(255,100,100,0.1);
          border: 1px solid rgba(255,100,100,0.3);
          color: #ff6464;
          padding: 0.75rem;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .login-btn {
          padding: 0.875rem;
          background: linear-gradient(135deg, #646cff, #5b5aff);
          border: none;
          color: #fff;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(100,108,255,0.3);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-hint {
          text-align: center;
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-top: 1rem;
        }
      `}</style>

      <div className="login-container">
        <h1>Admin Panel</h1>
        <p className="login-subtitle">Duffus Flooring Management</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="password">Admin Key</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin key"
              disabled={loading}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading || !password}>
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="login-hint">{isLocalHost() ? 'Default local admin key: emberveil' : 'Contact administrator for access credentials'}</p>
        </form>
      </div>
    </div>
  )
}
