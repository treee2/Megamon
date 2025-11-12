import React, { createContext, useContext, useState, useEffect } from 'react';

// Создаем контекст для хранения данных аутентификации
// Это позволит любому компоненту в приложении получить доступ к информации о текущем пользователе
const AuthContext = createContext(null);

// Хук для удобного доступа к контексту
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
};

// Провайдер контекста - оборачиваем им все приложение
export const AuthProvider = ({ children }) => {
  // Состояние для хранения email текущего пользователя
  // При первой загрузке пытаемся получить email из localStorage
  const [currentUserEmail, setCurrentUserEmail] = useState(() => {
    return localStorage.getItem('currentUserEmail') || null;
  });

  // Функция для входа в систему
  // Сохраняем email пользователя и записываем его в localStorage
  const login = (email) => {
    setCurrentUserEmail(email);
    localStorage.setItem('currentUserEmail', email);
  };

  // Функция для выхода из системы
  // Очищаем состояние и удаляем данные из localStorage
  const logout = () => {
    setCurrentUserEmail(null);
    localStorage.removeItem('currentUserEmail');
  };

  // Значение, которое будет доступно всем компонентам через useAuth()
  const value = {
    currentUserEmail,
    login,
    logout,
    isAuthenticated: !!currentUserEmail // true если пользователь авторизован
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};