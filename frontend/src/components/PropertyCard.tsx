import { useState } from 'react';
import type { Property } from '../types';
import './PropertyCard.css';

interface Props {
  property: Property;
}

const PropertyCard = ({ property }: Props) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [showBooking, setShowBooking] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const handleBook = async () => {
    if (!checkIn || !checkOut) {
      alert('Выберите даты заезда и выезда');
      return;
    }

    try {
      const webApp = window.Telegram?.WebApp;
      const user = webApp?.initDataUnsafe?.user;

      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: user?.id?.toString() || 'test_user',
          firstName: user?.first_name || 'Тест',
          username: user?.username,
          propertyId: property.id,
          checkIn,
          checkOut
        })
      });

      if (response.ok) {
        alert('Бронирование успешно создано!');
        setShowBooking(false);
        setCheckIn('');
        setCheckOut('');
      }
    } catch {
      alert('Ошибка бронирования');
    }
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => 
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="property-card">
      <div className="image-container">
        <img src={property.images[currentImage]} alt={property.title} />
        
        {property.images.length > 1 && (
          <>
            <button className="img-nav left" onClick={prevImage}>‹</button>
            <button className="img-nav right" onClick={nextImage}>›</button>
            <div className="image-dots">
              {property.images.map((_, idx) => (
                <span 
                  key={idx} 
                  className={idx === currentImage ? 'active' : ''}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="property-info">
        <h2>{property.title}</h2>
        <p className="price">{property.price.toLocaleString()} ₽ / ночь</p>
        
        <div className="details">
          <span>🛏 {property.rooms} комн.</span>
          <span>📐 {property.area} м²</span>
        </div>

        <p className="address">📍 {property.address}</p>
        <p className="description">{property.description}</p>

        {!showBooking ? (
          <button className="book-btn" onClick={() => setShowBooking(true)}>
            Забронировать
          </button>
        ) : (
          <div className="booking-form">
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              placeholder="Заезд"
            />
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              min={checkIn}
              placeholder="Выезд"
            />
            <div className="booking-actions">
              <button onClick={() => setShowBooking(false)}>Отмена</button>
              <button onClick={handleBook} className="confirm-btn">
                Подтвердить
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyCard;