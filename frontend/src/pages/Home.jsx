import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import RoomCard from '../components/RoomCard';
import { API_URL } from '../config';

const Home = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    checkIn: '',
    checkOut: '',
    guests: '1'
  });

  useEffect(() => {
    fetch(`${API_URL}/api/rooms`)
      .then((res) => res.json())
      .then((data) => {
        // Just show Deluxe and Suite as featured
        const featured = data.filter(r => r.type === 'Deluxe' || r.type === 'Suite').slice(0, 3);
        setFeaturedRooms(featured.length > 0 ? featured : data.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching rooms:', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    setSearchParams({ ...searchParams, [e.target.name]: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkIn: searchParams.checkIn,
      checkOut: searchParams.checkOut,
      guests: searchParams.guests
    }).toString();
    navigate(`/rooms?${query}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{ backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80')` }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-subtitle">Royal Haven Hotel & Suites</p>
          <h1 className="hero-title">Where Indulgence Meets Sanctuary</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '18px', marginBottom: '32px' }}>
            Experience an upscale getaway with majestic ocean vistas, world-class dining, and tailored concierge hospitality.
          </p>
          <Link to="/rooms" className="btn btn-primary">
            Explore Our Suites
          </Link>
        </div>
      </section>

      {/* Booking Search Bar Overlay */}
      <div className="container">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="search-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Check-In Date</label>
              <input 
                type="date" 
                name="checkIn"
                value={searchParams.checkIn}
                onChange={handleChange}
                className="form-control" 
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Check-Out Date</label>
              <input 
                type="date" 
                name="checkOut"
                value={searchParams.checkOut}
                onChange={handleChange}
                className="form-control" 
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Guests</label>
              <select 
                name="guests"
                value={searchParams.guests}
                onChange={handleChange}
                className="form-control"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              Check Availability
            </button>
          </div>
        </form>
      </div>

      {/* Featured Suites Section */}
      <section className="section-padding">
        <div className="container">
          <div className="section-header">
            <h2>Our Featured Suites</h2>
            <p>Each of our guest rooms is meticulously designed to offer a unique blend of comfort, elegance, and luxury.</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading rooms...</p>
          ) : (
            <div className="room-grid">
              {featuredRooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </div>
          )}
          
          <div className="text-center" style={{ marginTop: '40px' }}>
            <Link to="/rooms" className="btn btn-secondary">
              View All Accommodations
            </Link>
          </div>
        </div>
      </section>

      {/* Luxury Amenities Teaser */}
      <section className="section-padding" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-gold)', borderBottom: '1px solid var(--border-gold)' }}>
        <div className="container">
          <div className="section-header">
            <h2>The Royal Haven Experience</h2>
            <p>Elevate your stay with premium amenities curated for our most distinguished guests.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', color: 'var(--accent)', marginBottom: '16px' }}>🍽️</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Fine Dining</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Savor gourmet masterpieces created by Michelin-starred culinary teams using locally-sourced organic ingredients.
              </p>
            </div>
            
            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', color: 'var(--accent)', marginBottom: '16px' }}>💆</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Wellness Spa</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Rejuvenate your body and spirit with our bespoke herbal therapies, thermal pools, and deep-tissue relaxation rituals.
              </p>
            </div>

            <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', color: 'var(--accent)', marginBottom: '16px' }}>🏊</div>
              <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Infinity Pool</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Soak in the sun at our dramatic rooftop heated pool with full cocktail bar service and private cabanas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
