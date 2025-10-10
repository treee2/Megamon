import { useState } from 'react';
import './RegistrationPage.css';

interface RegistrationFormData {
  firstName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface RegistrationPageProps {
  onUserLogin?: (user: any) => void;
}

const RegistrationPage = ({ onUserLogin }: RegistrationPageProps) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [regFormData, setRegFormData] = useState<RegistrationFormData>({
    firstName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });

  const handleRegInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateRegistration = (): string | null => {
    if (!regFormData.firstName.trim()) {
      return 'Имя обязательно';
    }
    if (!regFormData.email.trim()) {
      return 'Email обязателен';
    }
    if (!regFormData.email.includes('@')) {
      return 'Некорректный email';
    }
    if (!regFormData.password) {
      return 'Пароль обязателен';
    }
    if (regFormData.password.length < 6) {
      return 'Пароль должен содержать минимум 6 символов';
    }
    if (regFormData.password !== regFormData.confirmPassword) {
      return 'Пароли не совпадают';
    }
    return null;
  };

  const validateLogin = (): string | null => {
    if (!loginFormData.email.trim()) {
      return 'Email обязателен';
    }
    if (!loginFormData.password) {
      return 'Пароль обязателен';
    }
    return null;
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateRegistration();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: regFormData.firstName,
          email: regFormData.email,
          phone: regFormData.phone || undefined,
          password: regFormData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Регистрация успешна! Теперь вы можете войти в систему.');
        setRegFormData({
          firstName: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
        setTimeout(() => setIsLogin(true), 2000);
      } else {
        setError(data.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validateLogin();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginFormData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Добро пожаловать, ${data.firstName || data.email}!`);
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem('user', JSON.stringify(data));
        // Уведомляем родительский компонент о входе пользователя
        if (onUserLogin) {
          onUserLogin(data);
        }
        // Перенаправление на главную страницу через 2 секунды
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(data.error || 'Ошибка авторизации');
      }
    } catch (err) {
      setError('Ошибка соединения с сервером');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <h1>{isLogin ? 'Вход в систему' : 'Регистрация'}</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email:</label>
              <input
                type="email"
                id="login-email"
                name="email"
                value={loginFormData.email}
                onChange={handleLoginInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Пароль:</label>
              <input
                type="password"
                id="login-password"
                name="password"
                value={loginFormData.password}
                onChange={handleLoginInputChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegistration} className="auth-form">
            <div className="form-group">
              <label htmlFor="firstName">Имя:</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={regFormData.firstName}
                onChange={handleRegInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={regFormData.email}
                onChange={handleRegInputChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Телефон (необязательно):</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={regFormData.phone}
                onChange={handleRegInputChange}
                disabled={loading}
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Пароль:</label>
              <input
                type="password"
                id="password"
                name="password"
                value={regFormData.password}
                onChange={handleRegInputChange}
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Подтвердите пароль:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={regFormData.confirmPassword}
                onChange={handleRegInputChange}
                required
                disabled={loading}
              />
            </div>

            <button type="submit" disabled={loading} className="submit-btn">
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
        )}

        <div className="auth-switch">
          <p>
            {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
              }}
              className="switch-btn"
              disabled={loading}
            >
              {isLogin ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;