import React, { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('bookings');
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Review State
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch user's bookings
      const bookingRes = await fetch('http://localhost:5001/api/bookings/my', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const bookingData = await bookingRes.json();
      setBookings(bookingData);

      // Fetch user's reviews
      const reviewRes = await fetch('http://localhost:5001/api/reviews/my', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const reviewData = await reviewRes.json();
      setReviews(reviewData);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (res.ok) {
        // Refresh bookings
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      } else {
        const data = await res.json();
        alert(data.message || 'Cancellation failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${editingReviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          rating: editRating,
          comment: editComment
        })
      });

      if (res.ok) {
        setEditingReviewId(null);
        // Refresh user's reviews
        const reviewRes = await fetch('http://localhost:5001/api/reviews/my', {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const reviewData = await reviewRes.json();
        setReviews(reviewData);
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (res.ok) {
        setReviews(reviews.filter(r => r._id !== reviewId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete review');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="container section-padding"><p style={{ textAlign: 'center' }}>Loading dashboard...</p></div>;
  }

  return (
    <div className="container section-padding">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px' }}>Guest Portal</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {user?.name}. Manage your reservations and reviews.</p>
      </div>

      <div className="dashboard-grid">
        {/* Left Sidebar */}
        <aside className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`sidebar-item-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              >
                My Bookings ({bookings.length})
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`sidebar-item-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              >
                My Reviews ({reviews.length})
              </button>
            </li>
          </ul>
        </aside>

        {/* Right Content Pane */}
        <main className="dashboard-content-box">
          {activeTab === 'bookings' && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Reservation History</h3>
              {bookings.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>You don't have any bookings yet.</p>
              ) : (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Suite / Room</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <strong>{booking.room?.name || 'Deleted Room'}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{booking.room?.type}</div>
                          </td>
                          <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                          <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                          <td style={{ color: '#ffffff', fontWeight: '500' }}>${booking.totalPrice}</td>
                          <td>
                            <span className={`status-badge status-${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            {booking.status !== 'cancelled' && (
                              <button 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="btn btn-danger btn-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Your Reviews</h3>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>You haven't left any reviews yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((review) => (
                    <div key={review._id} style={{ border: '1px solid var(--border-dim)', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                      {editingReviewId === review._id ? (
                        <form onSubmit={handleUpdateReview}>
                          <div className="form-group">
                            <label className="form-label">Rating</label>
                            <StarRating rating={editRating} onRatingChange={setEditRating} editable={true} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Comment</label>
                            <textarea
                              className="form-control"
                              rows="3"
                              value={editComment}
                              onChange={(e) => setEditComment(e.target.value)}
                              required
                            ></textarea>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                            <button type="submit" className="btn btn-primary btn-sm">Save</button>
                            <button type="button" onClick={() => setEditingReviewId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <div>
                              <strong style={{ color: '#ffffff' }}>{review.room?.name || 'Deleted Room'}</strong>
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '10px' }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <StarRating rating={review.rating} />
                          </div>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>"{review.comment}"</p>
                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '14px' }}>
                            <button 
                              onClick={() => handleStartEdit(review)} 
                              className="btn btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(review._id)} 
                              className="btn btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
