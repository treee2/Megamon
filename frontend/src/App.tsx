// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import { useEffect, useState } from 'react';
import PropertySwiper from './components/PropertySwiper';
import BookingsPage from './components/BookingsPage';
import RegistrationPage from './components/RegistrationPage';
import type { Property, User } from './types';
import './App.css';

function App() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'home' | 'bookings' | 'auth'>('home');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    if (webApp) {
      webApp.ready();
      webApp.expand();
    }

    // Проверяем, есть ли сохраненный пользователь
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Ошибка парсинга пользователя:', error);
        localStorage.removeItem('user');
      }
    }

    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/properties');
      const data = await response.json();
      setProperties(data);
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка объявлений...</p>
      </div>
    );
  }

  return (
    <div className="app">
      {currentPage === 'auth' ? (
        <>
          <button 
            className="back-btn"
            onClick={() => setCurrentPage('home')}
          >
            ← Назад
          </button>
          <RegistrationPage onUserLogin={setUser} />
        </>
      ) : currentPage === 'home' ? (
        <>
          <div className="header">
            <h1>🏠 Аренда жилья</h1>
            {user ? (
              <div className="user-info">
                <span>Привет, {user.firstName || user.email}!</span>
                <button onClick={handleLogout} className="logout-btn">
                  Выйти
                </button>
              </div>
            ) : (
              <button 
                className="auth-btn"
                onClick={() => setCurrentPage('auth')}
              >
                Войти / Регистрация
              </button>
            )}
          </div>
          <PropertySwiper properties={properties} />
          {user && (
            <button 
              className="bookings-btn"
              onClick={() => setCurrentPage('bookings')}
            >
              📋 Мои бронирования
            </button>
          )}
        </>
      ) : (
        <>
          <button 
            className="back-btn"
            onClick={() => setCurrentPage('home')}
          >
            ← Назад
          </button>
          <BookingsPage />
        </>
      )}
    </div>
  );
}

export default App;