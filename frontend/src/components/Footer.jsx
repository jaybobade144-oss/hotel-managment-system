import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <Link to="/" className="logo" style={{ display: 'inline-block', marginBottom: '16px' }}>
              ROYAL<span>HAVEN</span>
            </Link>
            <p style={{ marginTop: '10px' }}>
              Nestled in the heart of serenity, Royal Haven offers custom luxury services, pristine accommodations, and top-tier dining to create unforgettable stays.
            </p>
          </div>
          
          <div className="footer-col">
            <h3>Quick Links</h3>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/rooms">Suites & Rooms</Link></li>
              <li><Link to="/login">Account Access</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Our Services</h3>
            <ul>
              <li><a href="#spa">Royal Wellness Spa</a></li>
              <li><a href="#dining">Le Haven Gastronomy</a></li>
              <li><a href="#events">Banquets & Weddings</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3>Contact Us</h3>
            <p>
              100 Luxury Promenade Blvd,<br />
              Beverly Hills, CA 90210<br />
              <strong>Phone:</strong> +1 (555) 987-6543<br />
              <strong>Email:</strong> reserve@royalhaven.com
            </p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Royal Haven Hotel & Suites. All rights reserved.</p>
          <p>Designed with luxury in mind.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
