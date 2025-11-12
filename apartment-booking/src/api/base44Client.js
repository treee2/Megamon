// Базовый URL для API (сервер работает на порту 3001)
// Базовый URL для API
const API_BASE_URL = 'http://localhost:3001/api';

// Вспомогательная функция для выполнения запросов
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Ошибка при выполнении запроса');
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export const base44 = {
  entities: {
    Apartment: {
      list: async (sortOrder) => {
        return await fetchAPI('/apartments');
      },
      
      filter: async (params) => {
        if (params.id) {
          const apartment = await fetchAPI(`/apartments/${params.id}`);
          return [apartment];
        }
        return await fetchAPI('/apartments');
      },
      
      create: async (apartmentData) => {
        return await fetchAPI('/apartments', {
          method: 'POST',
          body: JSON.stringify(apartmentData),
        });
      },
      
      update: async (id, apartmentData) => {
        return await fetchAPI(`/apartments/${id}`, {
          method: 'PUT',
          body: JSON.stringify(apartmentData),
        });
      },
      
      delete: async (id) => {
        return await fetchAPI(`/apartments/${id}`, {
          method: 'DELETE',
        });
      }
    },
    
    Booking: {
      list: async (sortOrder) => {
        return await fetchAPI('/bookings');
      },
      
      filter: async (params) => {
        const bookings = await fetchAPI('/bookings');
        if (params.created_by) {
          return bookings.filter(b => b.created_by === params.created_by);
        }
        return bookings;
      },
      
      create: async (bookingData) => {
        return await fetchAPI('/bookings', {
          method: 'POST',
          body: JSON.stringify(bookingData),
        });
      },
      
      update: async (id, bookingData) => {
        return await fetchAPI(`/bookings/${id}`, {
          method: 'PUT',
          body: JSON.stringify(bookingData),
        });
      }
    },
    
    Review: {
      list: async (sortOrder) => {
        return await fetchAPI('/reviews');
      },
      
      filter: async (params) => {
        const reviews = await fetchAPI('/reviews');
        if (params.apartment_id) {
          return reviews.filter(r => r.apartment_id === params.apartment_id);
        }
        if (params.booking_id) {
          return reviews.filter(r => r.booking_id === params.booking_id);
        }
        return reviews;
      },
      
      create: async (reviewData) => {
        return await fetchAPI('/reviews', {
          method: 'POST',
          body: JSON.stringify(reviewData),
        });
      }
    },
    
    User: {
      list: async (sortOrder) => {
        return await fetchAPI('/users');
      },
      
      filter: async (params) => {
        const users = await fetchAPI('/users');
        if (params.email) {
          return users.filter(u => u.email === params.email);
        }
        return users;
      },
      
      update: async (id, userData) => {
        return await fetchAPI(`/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(userData),
        });
      }
    }
  },
  
  auth: {
    // Регистрация нового пользователя
    register: async (userData) => {
      return await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    },
    
    // Вход в систему
    login: async (login, password) => {
      return await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, password }),
      });
    },
    
    // Получить данные текущего пользователя по email
    me: async (email) => {
      if (!email) {
        throw new Error('Email не указан');
      }
      return await fetchAPI(`/users/me?email=${encodeURIComponent(email)}`);
    },
    
    // Обновить профиль текущего пользователя
    updateMe: async (profileData) => {
      return await fetchAPI('/users/me', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
  }
};