import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import StarRating from '../components/StarRating';

const RoomDetails = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  
  // Booking Form State
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [bookingMessage, setBookingMessage] = useState(null);
  const [bookingError, setBookingError] = useState(null);

  // Review Form State
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(null);

  // Editing Review State
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');

  useEffect(() => {
    fetchRoomAndReviews();
  }, [id]);

  const fetchRoomAndReviews = async () => {
    setLoading(true);
    try {
      const roomRes = await fetch(`http://localhost:5001/api/rooms/${id}`);
      const roomData = await roomRes.json();
      setRoom(roomData);
      if (roomData.imageUrls && roomData.imageUrls.length > 0) {
        setActiveImage(roomData.imageUrls[0]);
      }

      const reviewRes = await fetch(`http://localhost:5001/api/reviews/room/${id}`);
      const reviewData = await reviewRes.json();
      setReviews(reviewData);

      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Calculate booking details
  const getNights = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    if (start >= end) return 0;
    const diff = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const nights = getNights();
  const totalPrice = room ? nights * room.price : 0;

  const handleBook = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setBookingError(null);
    setBookingMessage(null);

    if (nights <= 0) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          roomId: id,
          checkInDate,
          checkOutDate
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setBookingError(data.message || 'Booking failed');
      } else {
        setBookingMessage('Your reservation has been placed successfully! View status in dashboard.');
        setCheckInDate('');
        setCheckOutDate('');
      }
    } catch (err) {
      setBookingError('An error occurred during booking. Please try again.');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const res = await fetch('http://localhost:5001/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          roomId: id,
          rating,
          comment
        })
      });

      const data = await res.json();
      if (!res.ok) {
        setReviewError(data.message || 'Failed to submit review');
      } else {
        setReviewSuccess('Review posted successfully!');
        setComment('');
        setRating(5);
        // Refresh reviews list
        const reviewRes = await fetch(`http://localhost:5001/api/reviews/room/${id}`);
        const reviewData = await reviewRes.json();
        setReviews(reviewData);
      }
    } catch (err) {
      setReviewError('Error submitting review');
    }
  };

  const handleReviewDelete = async (reviewId) => {
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

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleReviewUpdate = async (e) => {
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
        // Refresh reviews list
        const reviewRes = await fetch(`http://localhost:5001/api/reviews/room/${id}`);
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

  if (loading) {
    return <div className="container section-padding"><p style={{ textAlign: 'center' }}>Loading room details...</p></div>;
  }

  if (!room) {
    return <div className="container section-padding"><p style={{ textAlign: 'center' }}>Room not found.</p></div>;
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length).toFixed(1) 
    : 'No reviews';

  // Check if logged-in user already left a review
  const userReview = user ? reviews.find(r => r.user?._id === user._id) : null;
  const otherReviews = user ? reviews.filter(r => r.user?._id !== user._id) : reviews;

  return (
    <div className="container section-padding">
      <Link to="/rooms" style={{ color: 'var(--accent)', display: 'inline-block', marginBottom: '24px' }}>
        ← Back to Accommodations
      </Link>

      <div className="room-gallery">
        <img 
          src={activeImage || room.imageUrls?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'} 
          alt={room.name} 
          className="room-main-img"
        />
        {room.imageUrls && room.imageUrls.length > 1 && (
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
            {room.imageUrls.map((url, idx) => (
              <img 
                key={idx}
                src={url}
                alt={`${room.name} ${idx + 1}`}
                onClick={() => setActiveImage(url)}
                style={{ 
                  width: 'calc(25% - 9px)',
                  height: '100px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  border: (activeImage || room.imageUrls[0]) === url ? '2px solid var(--accent)' : '1px solid var(--border-dim)',
                  opacity: (activeImage || room.imageUrls[0]) === url ? 1 : 0.6,
                  transition: 'var(--transition-fast)'
                }}
              />
            ))}
          </div>
        )}
      </div>

      <div className="room-details-grid">
        {/* Left Side: Room details */}
        <div className="details-content">
          <span className="room-type-badge">{room.type}</span>
          <h2>{room.name}</h2>
          
          <div className="details-meta">
            <div className="meta-item">
              Rating: <strong>★ {averageRating}</strong> ({reviews.length} reviews)
            </div>
            <div className="meta-item">
              Capacity: <strong>{room.maxGuests} Guests Max</strong>
            </div>
            <div className="meta-item">
              Price: <strong>${room.price} / Night</strong>
            </div>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '16px', lineHeight: '1.8' }}>
            {room.description}
          </p>

          <h3 style={{ fontSize: '24px', margin: '40px 0 20px 0', borderBottom: '1px solid var(--border-dim)', paddingBottom: '10px' }}>
            Room Amenities
          </h3>
          <div className="amenities-list">
            {room.amenities?.map((amenity, index) => (
              <div key={index} className="amenity-item">
                {amenity}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Booking Form */}
        <div className="booking-widget">
          <h3 className="booking-widget-title">Book Your Stay</h3>
          {bookingError && <div className="alert alert-error">{bookingError}</div>}
          {bookingMessage && <div className="alert alert-success">{bookingMessage}</div>}
          
          <form onSubmit={handleBook}>
            <div className="form-group">
              <label className="form-label">Check-In</label>
              <input 
                type="date" 
                className="form-control" 
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Check-Out</label>
              <input 
                type="date" 
                className="form-control" 
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>

            {nights > 0 && (
              <div style={{ margin: '20px 0', padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div className="booking-summary-row">
                  <span>Price per night</span>
                  <span>${room.price}</span>
                </div>
                <div className="booking-summary-row">
                  <span>Total Nights</span>
                  <span>{nights} nights</span>
                </div>
                <div className="booking-summary-row booking-total">
                  <span>Total Cost</span>
                  <span>${totalPrice}</span>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }}>
              {user ? 'Confirm Reservation' : 'Login to Book'}
            </button>
          </form>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-container">
        <div className="reviews-header">
          <h3>Guest Reviews & Feedback</h3>
          <div style={{ fontSize: '18px', fontWeight: '500', color: 'var(--accent)' }}>
            ★ {averageRating} Avg Rating
          </div>
        </div>

        {/* Inline User Review (if exists, handles U/D of Review CRUD) */}
        {userReview && (
          <div style={{ marginBottom: '32px' }}>
            <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '18px' }}>Your Review</h4>
            {editingReviewId === userReview._id ? (
              <form onSubmit={handleReviewUpdate} className="review-form-box">
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
                  <button type="submit" className="btn btn-primary btn-sm">Save Changes</button>
                  <button type="button" onClick={() => setEditingReviewId(null)} className="btn btn-secondary btn-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="review-item" style={{ borderLeft: '4px solid var(--accent)' }}>
                <div className="review-author">
                  <div className="author-info">
                    <h4>{userReview.user?.name} <span style={{ color: 'var(--accent)', fontSize: '11px', marginLeft: '6px' }}>(You)</span></h4>
                    <span className="review-date">
                      {new Date(userReview.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={userReview.rating} />
                </div>
                <p className="review-comment">{userReview.comment}</p>
                <div className="review-actions">
                  <button onClick={() => handleStartEdit(userReview)} className="btn btn-secondary btn-sm">
                    Edit Review
                  </button>
                  <button onClick={() => handleReviewDelete(userReview._id)} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create Review Form (if user is logged in & has not left a review yet, handles C of Review CRUD) */}
        {user && !userReview && (
          <div style={{ marginBottom: '40px' }}>
            <h4 style={{ marginBottom: '16px', fontSize: '20px' }}>Share Your Experience</h4>
            {reviewError && <div className="alert alert-error">{reviewError}</div>}
            {reviewSuccess && <div className="alert alert-success">{reviewSuccess}</div>}
            
            <form onSubmit={handleReviewSubmit} className="review-form-box">
              <div className="form-group">
                <label className="form-label">Select Star Rating</label>
                <StarRating rating={rating} onRatingChange={setRating} editable={true} />
              </div>
              <div className="form-group">
                <label className="form-label">Your Comments</label>
                <textarea
                  className="form-control"
                  rows="4"
                  placeholder="Tell future guests about your stay, room cleanliness, comfort..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary">
                Post Review
              </button>
            </form>
          </div>
        )}

        {/* Informative sign in prompt if not logged in */}
        {!user && (
          <div className="review-form-box" style={{ textAlign: 'center', marginBottom: '40px', padding: '30px' }}>
            <h4 style={{ marginBottom: '10px' }}>Want to leave a review?</h4>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Only verified accounts can publish reviews for hotel rooms.</p>
            <Link to="/login" className="btn btn-secondary btn-sm">Sign In to Write Review</Link>
          </div>
        )}

        {/* List of Other Reviews (handles R of Review CRUD) */}
        <h4 style={{ marginBottom: '20px', fontSize: '20px' }}>What Other Guests Say</h4>
        {otherReviews.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
            No reviews yet for this room. Be the first to share your thoughts!
          </p>
        ) : (
          <div className="review-list">
            {otherReviews.map((rev) => (
              <div key={rev._id} className="review-item">
                <div className="review-author">
                  <div className="author-info">
                    <h4>{rev.user?.name || 'Anonymous'}</h4>
                    <span className="review-date">
                      {new Date(rev.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <StarRating rating={rev.rating} />
                </div>
                <p className="review-comment">{rev.comment}</p>
                
                {/* Admin moderation delete capability */}
                {user && user.role === 'admin' && (
                  <div className="review-actions">
                    <button onClick={() => handleReviewDelete(rev._id)} className="btn btn-danger btn-sm">
                      Admin Remove
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomDetails;
