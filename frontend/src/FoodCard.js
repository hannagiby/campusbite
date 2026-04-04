import React from 'react';
import './FoodCard.css';

const FoodCard = ({ image, tag, title, description, price }) => {
  return (
    <div className="food-card">
      <div className="food-card-image-container">
        <img src={image} alt={title} className="food-card-image" />
        <span className={`food-card-tag tag-${tag.toLowerCase()}`}>{tag}</span>
      </div>
      <div className="food-card-content">
        <h3 className="food-card-title">{title}</h3>
        <p className="food-card-description">{description}</p>
        <div className="food-card-footer">
          <span className="food-card-price">₹{price}</span>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
