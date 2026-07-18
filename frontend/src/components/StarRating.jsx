import React from 'react';

const StarRating = ({ rating, onRatingChange, editable = false }) => {
  const stars = [1, 2, 3, 4, 5];

  if (editable) {
    return (
      <div className="star-rating">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            className={`star-btn ${star <= rating ? 'active' : ''}`}
            onClick={() => onRatingChange && onRatingChange(star)}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="star-rating">
      {stars.map((star) => (
        <span
          key={star}
          className={`star-icon ${star <= rating ? 'filled' : ''}`}
        >
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

export default StarRating;
