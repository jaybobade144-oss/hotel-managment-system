import React, { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Room creation & update
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [roomForm, setRoomForm] = useState({
    name: '',
    type: 'Single',
    price: 150,
    maxGuests: 2,
    description: '',
    amenities: '',
    imageUrl: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Get all rooms
      const roomRes = await fetch('http://localhost:5001/api/rooms');
      const roomData = await roomRes.json();
      setRooms(roomData);

      // Get all bookings
      const bookingRes = await fetch('http://localhost:5001/api/bookings', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const bookingData = await bookingRes.json();
      setBookings(bookingData);

      // Get all reviews
      const reviewRes = await fetch('http://localhost:5001/api/reviews', {
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

  const handleOpenCreateModal = () => {
    setEditingRoomId(null);
    setRoomForm({
      name: '',
      type: 'Single',
      price: 150,
      maxGuests: 2,
      description: '',
      amenities: 'Wi-Fi, AC, TV',
      imageUrl: ''
    });
    setShowRoomModal(true);
  };

  const handleOpenEditModal = (room) => {
    setEditingRoomId(room._id);
    setRoomForm({
      name: room.name,
      type: room.type,
      price: room.price,
      maxGuests: room.maxGuests,
      description: room.description,
      amenities: room.amenities?.join(', ') || '',
      imageUrl: room.imageUrls?.[0] || ''
    });
    setShowRoomModal(true);
  };

  const handleRoomFormSubmit = async (e) => {
    e.preventDefault();
    const amenitiesArr = roomForm.amenities.split(',').map(a => a.trim()).filter(a => a !== '');
    const reqBody = {
      name: roomForm.name,
      type: roomForm.type,
      price: Number(roomForm.price),
      maxGuests: Number(roomForm.maxGuests),
      description: roomForm.description,
      amenities: amenitiesArr,
      imageUrls: roomForm.imageUrl ? [roomForm.imageUrl] : ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80']
    };

    try {
      const url = editingRoomId 
        ? `http://localhost:5001/api/rooms/${editingRoomId}`
        : 'http://localhost:5001/api/rooms';
      
      const method = editingRoomId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(reqBody)
      });

      if (res.ok) {
        setShowRoomModal(false);
        fetchAdminData(); // Refresh list
      } else {
        const data = await res.json();
        alert(data.message || 'Operation failed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room? This cannot be undone.')) return;

    try {
      const res = await fetch(`http://localhost:5001/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (res.ok) {
        setRooms(rooms.filter(r => r._id !== roomId));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to delete room');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5001/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to update booking status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? (Admin moderation)')) return;

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

  // Compute stats
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 'N/A';

  if (loading) {
    return <div className="container section-padding"><p style={{ textAlign: 'center' }}>Loading Admin Console...</p></div>;
  }

  return (
    <div className="container section-padding">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '32px' }}>
        <h2 style={{ fontSize: '32px' }}>Admin Dashboard</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome to the Royal Haven control panel. Manage rooms, bookings, and moderate reviews.</p>
      </div>

      <div className="dashboard-grid">
        {/* Sidebar Menu */}
        <aside className="dashboard-sidebar">
          <ul className="sidebar-menu">
            <li>
              <button 
                onClick={() => setActiveTab('overview')}
                className={`sidebar-item-btn ${activeTab === 'overview' ? 'active' : ''}`}
              >
                Overview Metrics
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('rooms')}
                className={`sidebar-item-btn ${activeTab === 'rooms' ? 'active' : ''}`}
              >
                Manage Rooms ({rooms.length})
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('bookings')}
                className={`sidebar-item-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              >
                Manage Bookings ({bookings.length})
              </button>
            </li>
            <li>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`sidebar-item-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              >
                Moderate Reviews ({reviews.length})
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Pane */}
        <main className="dashboard-content-box">
          {activeTab === 'overview' && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '24px' }}>Business Metrics</h3>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-lbl">Confirmed Revenue</div>
                  <div className="stat-val">${totalRevenue}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Total Bookings</div>
                  <div className="stat-val">{bookings.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Rooms Count</div>
                  <div className="stat-val">{rooms.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Average Rating</div>
                  <div className="stat-val">★ {averageRating}</div>
                </div>
              </div>

              <div style={{ marginTop: '40px' }}>
                <h4 style={{ marginBottom: '16px' }}>Recent Reservations</h4>
                {bookings.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No bookings recorded yet.</p>
                ) : (
                  <div className="data-table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Guest</th>
                          <th>Room</th>
                          <th>Dates</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.slice(0, 5).map((booking) => (
                          <tr key={booking._id}>
                            <td>{booking.user?.name || 'Deleted User'}</td>
                            <td>{booking.room?.name || 'Deleted Room'}</td>
                            <td>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</td>
                            <td>${booking.totalPrice}</td>
                            <td>
                              <span className={`status-badge status-${booking.status}`}>
                                {booking.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '24px' }}>Hotel Rooms & Suites</h3>
                <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm">
                  Add New Room
                </button>
              </div>

              {rooms.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No rooms configured. Click Add New Room to build catalog.</p>
              ) : (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Room Name</th>
                        <th>Type</th>
                        <th>Price/Night</th>
                        <th>Max Guests</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rooms.map((room) => (
                        <tr key={room._id}>
                          <td>
                            <img 
                              src={room.imageUrls?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=100&q=80'} 
                              alt={room.name} 
                              style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                          </td>
                          <td><strong>{room.name}</strong></td>
                          <td>{room.type}</td>
                          <td style={{ color: 'var(--accent)', fontWeight: '500' }}>${room.price}</td>
                          <td>{room.maxGuests} guests</td>
                          <td>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleOpenEditModal(room)} className="btn btn-secondary btn-sm">
                                Edit
                              </button>
                              <button onClick={() => handleDeleteRoom(room._id)} className="btn btn-danger btn-sm">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bookings' && (
            <div>
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Guest Reservations</h3>
              {bookings.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No reservations placed yet.</p>
              ) : (
                <div className="data-table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Guest</th>
                        <th>Room</th>
                        <th>Dates</th>
                        <th>Total Cost</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => (
                        <tr key={booking._id}>
                          <td>
                            <strong>{booking.user?.name || 'Deleted User'}</strong>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{booking.user?.email}</div>
                          </td>
                          <td>{booking.room?.name || 'Deleted Room'}</td>
                          <td>{new Date(booking.checkInDate).toLocaleDateString()} - {new Date(booking.checkOutDate).toLocaleDateString()}</td>
                          <td>${booking.totalPrice}</td>
                          <td>
                            <span className={`status-badge status-${booking.status}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td>
                            {booking.status === 'pending' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '10px' }}
                                >
                                  Confirm
                                </button>
                                <button 
                                  onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                  className="btn btn-danger btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '10px' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            {booking.status === 'confirmed' && (
                              <button 
                                onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '4px 8px', fontSize: '10px' }}
                              >
                                Cancel Booking
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
              <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>Review Moderation</h3>
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No user reviews recorded.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((review) => (
                    <div key={review._id} style={{ border: '1px solid var(--border-dim)', padding: '20px', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(255, 255, 255, 0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                        <div>
                          <strong>{review.user?.name || 'Deleted User'}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: '8px' }}>
                            reviewed <strong>{review.room?.name || 'Deleted Room'}</strong>
                          </span>
                        </div>
                        <StarRating rating={review.rating} />
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', fontStyle: 'italic' }}>"{review.comment}"</p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Posted: {new Date(review.createdAt).toLocaleString()}
                        </span>
                        <button 
                          onClick={() => handleDeleteReview(review._id)} 
                          className="btn btn-danger btn-sm"
                        >
                          Remove Review
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Room Modal Overlay */}
      {showRoomModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingRoomId ? 'Edit Room Specifications' : 'Define New Hotel Room'}</h3>
              <button onClick={() => setShowRoomModal(false)} className="modal-close">&times;</button>
            </div>
            
            <form onSubmit={handleRoomFormSubmit}>
              <div className="form-group">
                <label className="form-label">Room / Suite Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Room Type</label>
                  <select
                    className="form-control"
                    value={roomForm.type}
                    onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                  >
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Deluxe">Deluxe</option>
                    <option value="Suite">Suite</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price per Night ($)</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={roomForm.price}
                    onChange={(e) => setRoomForm({ ...roomForm, price: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Max Guests Capacity</label>
                  <input 
                    type="number" 
                    className="form-control"
                    value={roomForm.maxGuests}
                    onChange={(e) => setRoomForm({ ...roomForm, maxGuests: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input 
                    type="text" 
                    className="form-control"
                    placeholder="https://images.unsplash.com/..."
                    value={roomForm.imageUrl}
                    onChange={(e) => setRoomForm({ ...roomForm, imageUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Amenities (comma-separated)</label>
                <input 
                  type="text" 
                  className="form-control"
                  placeholder="Wi-Fi, AC, Balcony, Safe"
                  value={roomForm.amenities}
                  onChange={(e) => setRoomForm({ ...roomForm, amenities: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room Description</label>
                <textarea 
                  className="form-control"
                  rows="3"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  required
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowRoomModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingRoomId ? 'Save Changes' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
