import { useEffect, useState } from 'react';
import type { Booking } from '../types';
import './BookingsPage.css';

const BookingsPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const webApp = window.Telegram?.WebApp;
      const telegramId = webApp?.initDataUnsafe?.user?.id?.toString() || 'test_user';

      const response = await fetch(`http://localhost:3000/api/bookings/${telegramId}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Ошибка загрузки бронирований:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    const statuses: { [key: string]: string } = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтверждено',
      cancelled: 'Отменено'
    };
    return statuses[status] || status;
  };

  const getStatusClass = (status: string) => {
    return `status-${status}`;
  };

  if (loading) {
    return (
      <div className="bookings-loading">
        <div className="spinner"></div>
        <p>Загрузка бронирований...</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="bookings-empty">
        <h2>📋 Нет бронирований</h2>
        <p>Вы еще ничего не забронировали</p>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <h1>Мои бронирования</h1>
      <div className="bookings-list">
        {bookings.map((booking) => (
          <div key={booking.id} className="booking-card">
            {booking.property && (
              <>
                <div className="booking-image">
                  <img 
                    src={booking.property.images[0]} 
                    alt={booking.property.title}
                  />
                  <span className={`booking-status ${getStatusClass(booking.status)}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
                <div className="booking-info">
                  <h3>{booking.property.title}</h3>
                  <p className="booking-address">📍 {booking.property.address}</p>
                  
                  <div className="booking-dates">
                    <div className="date-block">
                      <span className="date-label">Заезд</span>
                      <span className="date-value">{formatDate(booking.checkIn)}</span>
                    </div>
                    <div className="date-arrow">→</div>
                    <div className="date-block">
                      <span className="date-label">Выезд</span>
                      <span className="date-value">{formatDate(booking.checkOut)}</span>
                    </div>
                  </div>

                  <div className="booking-details">
                    <span>🛏 {booking.property.rooms} комн.</span>
                    <span>📐 {booking.property.area} м²</span>
                    <span className="booking-price">
                      {booking.property.price.toLocaleString()} ₽/ночь
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BookingsPage;