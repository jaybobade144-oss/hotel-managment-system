import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import { API_URL } from '../config';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Filters State
  const [type, setType] = useState('All');
  const [guests, setGuests] = useState('All');
  const [maxPrice, setMaxPrice] = useState(500);

  // Read URL search params initially if redirected from home
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlGuests = searchParams.get('guests');
    if (urlGuests) {
      setGuests(urlGuests);
    }
  }, [location.search]);

  useEffect(() => {
    fetchRooms();
  }, [type, guests, maxPrice]);

  const fetchRooms = () => {
    setLoading(true);
    let url = `${API_URL}/api/rooms?`;
    if (type && type !== 'All') {
      url += `type=${type}&`;
    }
    if (guests && guests !== 'All') {
      url += `maxGuests=${guests}&`;
    }
    if (maxPrice) {
      url += `maxPrice=${maxPrice}&`;
    }

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setRooms(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="container section-padding">
      <div className="section-header">
        <h2>Our Luxury Accommodations</h2>
        <p>Browse our handpicked suites and secure your perfect high-end retreat.</p>
      </div>

      {/* Filter Options */}
      <div className="search-bar" style={{ marginTop: 0, marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Room Type</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value)} 
              className="form-control"
            >
              <option value="All">All Types</option>
              <option value="Single">Cozy Single</option>
              <option value="Double">Harmony Double</option>
              <option value="Deluxe">Opulent Deluxe</option>
              <option value="Suite">Royal Grand Suite</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Min Capacity</label>
            <select 
              value={guests} 
              onChange={(e) => setGuests(e.target.value)} 
              className="form-control"
            >
              <option value="All">Any Guests</option>
              <option value="1">1+ Guest</option>
              <option value="2">2+ Guests</option>
              <option value="3">3+ Guests</option>
              <option value="4">4+ Guests</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Max Price per Night: ${maxPrice}</label>
            <input 
              type="range" 
              min="100" 
              max="600" 
              step="20"
              value={maxPrice} 
              onChange={(e) => setMaxPrice(Number(e.target.value))} 
              style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}
            />
          </div>
        </div>
      </div>

      {/* Rooms Listing */}
      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading our collections...</p>
      ) : rooms.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>No Rooms Match Your Criteria</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Try broadening your filter criteria or adjusting pricing thresholds.</p>
        </div>
      ) : (
        <div className="room-grid">
          {rooms.map((room) => (
            <RoomCard key={room._id} room={room} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
