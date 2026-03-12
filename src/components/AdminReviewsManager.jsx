import { useState, useEffect, useCallback } from 'react'
import { adminFetch } from '../lib/adminApi'
import { resolveAssetUrl } from '../lib/reviews'

export default function AdminReviewsManager({ adminKey, onUpdate }) {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const loadReviews = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminFetch('/api/admin/reviews', adminKey)
      const data = await res.json()
      setReviews(data.reverse())
    } catch (e) {
      console.error('Failed to load reviews:', e)
    } finally {
      setLoading(false)
    }
  }, [adminKey])

  useEffect(() => {
    loadReviews()
  }, [adminKey, loadReviews])

  const handleDelete = async (id) => {
    if (!confirm('Delete this review? This cannot be undone.')) return

    try {
      const res = await adminFetch(`/api/admin/reviews/${id}`, adminKey, {
        method: 'DELETE'
      })
      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
        onUpdate()
      }
    } catch (e) {
      console.error('Failed to delete review:', e)
      alert('Error deleting review')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating) => {
    return '⭐'.repeat(rating)
  }

  return (
    <div>
      <style>{`
        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(100,108,255,0.2);
        }

        .reviews-header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .reviews-count {
          color: rgba(255,255,255,0.7);
          font-size: 0.95rem;
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .review-card {
          background: rgba(100,108,255,0.05);
          border: 1px solid rgba(100,108,255,0.2);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .review-info h3 {
          margin: 0 0 0.25rem;
          font-size: 1.1rem;
        }

        .review-rating {
          font-size: 1.2rem;
          margin: 0.25rem 0;
        }

        .review-date {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin: 0;
        }

        .review-image {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 8px;
          margin: 1rem 0;
        }

        .review-text {
          color: rgba(255,255,255,0.9);
          line-height: 1.6;
          margin: 1rem 0;
          flex: 1;
        }

        .review-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid rgba(100,108,255,0.2);
        }

        .review-btn {
          flex: 1;
          padding: 0.6rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.3s ease;
        }

        .review-btn.delete {
          background: rgba(255,100,100,0.1);
          color: #ff6464;
          border: 1px solid rgba(255,100,100,0.2);
        }

        .review-btn.delete:hover {
          background: rgba(255,100,100,0.2);
          border-color: rgba(255,100,100,0.3);
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(255,255,255,0.5);
        }

        .no-image-placeholder {
          width: 100%;
          height: 200px;
          background: rgba(100,108,255,0.1);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
          font-size: 3rem;
          margin: 1rem 0;
        }

        @media (max-width: 768px) {
          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="reviews-header">
        <div>
          <h1>⭐ Customer Reviews</h1>
          <p className="reviews-count">{reviews.length} total reviews</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="empty-state">
          <p>No reviews yet</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-info">
                  <h3>{review.name}</h3>
                  <div className="review-rating">{renderStars(review.rating)}</div>
                  <p className="review-date">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {review.image ? (
                <img 
                  src={resolveAssetUrl(review.image)} 
                  alt={`Review by ${review.name}`}
                  className="review-image"
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div className="no-image-placeholder">📝</div>
              )}

              <p className="review-text">{review.text}</p>

              <div className="review-actions">
                <button 
                  className="review-btn delete"
                  onClick={() => handleDelete(review.id)}
                >
                  🗑 Delete Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
