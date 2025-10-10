import { useState } from 'react';
import PropertyCard from './PropertyCard';
import type { Property } from '../types';
import './PropertySwiper.css';

interface Props {
  properties: Property[];
}

const PropertySwiper = ({ properties }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);

  const handleNext = () => {
    if (currentIndex < properties.length - 1) {
      setDirection('up');
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setDirection(null);
      }, 300);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection('down');
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1);
        setDirection(null);
      }, 300);
    }
  };

  let touchStartY = 0;
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY - touchEndY;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
  };

  return (
    <div 
      className="property-swiper"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={`card-container ${direction || ''}`}>
        {properties.map((property, index) => (
          <div
            key={property.id}
            className={`card-wrapper ${
              index === currentIndex ? 'active' : 
              index < currentIndex ? 'prev' : 'next'
            }`}
          >
            {Math.abs(index - currentIndex) <= 1 && (
              <PropertyCard property={property} />
            )}
          </div>
        ))}
      </div>

      <div className="navigation">
        <button 
          onClick={handlePrev} 
          disabled={currentIndex === 0}
          className="nav-btn"
        >
          ↑
        </button>
        <span className="counter">
          {currentIndex + 1} / {properties.length}
        </span>
        <button 
          onClick={handleNext} 
          disabled={currentIndex === properties.length - 1}
          className="nav-btn"
        >
          ↓
        </button>
      </div>
    </div>
  );
};

export default PropertySwiper;