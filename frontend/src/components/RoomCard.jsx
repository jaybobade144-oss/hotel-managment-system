import React from 'react';
import { Link } from 'react-router-dom';

const RoomCard = ({ room }) => {
  return (
    <div className="card">
      <img 
        src={room.imageUrls?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'} 
        alt={room.name} 
        className="room-card-img"
      />
      <div className="room-card-content">
        <span className="room-type-badge">{room.type}</span>
        <h3 className="room-card-title">{room.name}</h3>
        <p className="room-card-price">
          ${room.price} <span>/ night</span>
        </p>
        
        <div className="room-card-features">
          <span className="feature-tag">Max Guests: {room.maxGuests}</span>
          {room.amenities?.slice(0, 3).map((amenity, index) => (
            <span key={index} className="feature-tag">{amenity}</span>
          ))}
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {room.description}
        </p>
        
        <Link to={`/rooms/${room._id}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
          View Details
        </Link>
      </div>
    </div>
  );
};

export default RoomCard;
