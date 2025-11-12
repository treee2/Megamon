-- Удаляем таблицы, если они уже существуют (для чистого старта)
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS apartments;
DROP TABLE IF EXISTS users;

-- Создаём таблицу пользователей
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    login TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,  -- В реальном проекте нужно хешировать пароли!
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth TEXT,
    address TEXT,
    avatar TEXT,  -- URL аватара пользователя
    role TEXT DEFAULT 'user',  -- 'user' или 'admin'
    
    -- Паспортные данные
    passport_series TEXT,
    passport_number TEXT,
    passport_issued_by TEXT,
    passport_issue_date TEXT,
    
    -- Предпочтения пользователя (храним как JSON)
    preferences TEXT,
    
    -- Флаг завершенности профиля
    profile_completed INTEGER DEFAULT 0,
    
    -- Флаг блокировки пользователя
    is_blocked INTEGER DEFAULT 0,
    
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Создаём таблицу квартир
CREATE TABLE apartments (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    city TEXT NOT NULL,  -- Добавлено обязательное поле города
    address TEXT,
    price_per_night REAL NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER DEFAULT 1,
    max_guests INTEGER DEFAULT 2,
    is_available INTEGER DEFAULT 1,
    amenities TEXT,  -- Храним JSON-строку с удобствами
    image_filename TEXT,
    image_url TEXT,
    
    -- Статус модерации
    moderation_status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected'
    
    -- Владелец квартиры
    created_by TEXT NOT NULL,  -- Email владельца
    
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE
);

-- Создаём таблицу бронирований
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    apartment_id TEXT NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    guests INTEGER NOT NULL,
    total_price REAL NOT NULL,
    special_requests TEXT,
    status TEXT DEFAULT 'pending',  -- 'pending', 'confirmed', 'cancelled', 'completed'
    
    -- Кто создал бронирование
    created_by TEXT NOT NULL,  -- Email пользователя
    
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE
);

-- Создаём таблицу отзывов
CREATE TABLE reviews (
    id TEXT PRIMARY KEY,
    apartment_id TEXT NOT NULL,
    booking_id TEXT NOT NULL,
    
    -- Общая оценка и комментарий
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    
    -- Детальные оценки
    cleanliness INTEGER CHECK(cleanliness >= 1 AND cleanliness <= 5),
    communication INTEGER CHECK(communication >= 1 AND communication <= 5),
    location INTEGER CHECK(location >= 1 AND location <= 5),
    value INTEGER CHECK(value >= 1 AND value <= 5),
    
    -- Кто оставил отзыв
    created_by TEXT NOT NULL,  -- Email автора отзыва
    
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE,
    
    -- Один отзыв на одно бронирование
    UNIQUE(booking_id)
);

-- Создаём индексы для ускорения поиска
CREATE INDEX idx_apartments_available ON apartments(is_available);
CREATE INDEX idx_apartments_price ON apartments(price_per_night);
CREATE INDEX idx_apartments_city ON apartments(city);
CREATE INDEX idx_apartments_moderation ON apartments(moderation_status);
CREATE INDEX idx_apartments_created_by ON apartments(created_by);

CREATE INDEX idx_bookings_apartment ON bookings(apartment_id);
CREATE INDEX idx_bookings_created_by ON bookings(created_by);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);

CREATE INDEX idx_reviews_apartment ON reviews(apartment_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_created_by ON reviews(created_by);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_role ON users(role);

-- Вставляем тестовых пользователей
-- Пароль для всех: password123 (в реальном приложении нужно хешировать!)
INSERT INTO users (id, login, password, email, full_name, phone, preferences, profile_completed, role, avatar)
VALUES 
('user_1', 'admin', 'password123', 'admin@example.com', 'Администратор Системы', '+7 (999) 000-00-00', '{"smoking":false,"pets":false,"early_checkin":false}', 1, 'admin', NULL),
('user_2', 'ivan.petrov', 'password123', 'ivan@example.com', 'Иван Петров', '+7 (999) 123-45-67', '{"smoking":false,"pets":false,"early_checkin":true}', 1, 'user', NULL),
('user_3', 'maria.ivanova', 'password123', 'maria@example.com', 'Мария Иванова', '+7 (999) 234-56-78', '{"smoking":false,"pets":true,"early_checkin":false}', 1, 'user', NULL);

-- Вставляем тестовые данные квартир
INSERT INTO apartments (id, title, description, city, address, price_per_night, bedrooms, bathrooms, max_guests, is_available, amenities, image_filename, moderation_status, created_by)
VALUES 
('1', 'Уютная студия в центре', 'Современная квартира с прекрасным видом на город. Идеально подходит для одного или двух человек.', 'Москва', 'ул. Пушкина, д. 10', 5000, 1, 1, 2, 1, '["Wi-Fi","ТВ","Кондиционер"]', 'apartment-1.jpg', 'approved', 'ivan@example.com'),

('2', 'Просторные апартаменты', 'Роскошная квартира для семейного отдыха с тремя спальнями и современной кухней.', 'Санкт-Петербург', 'Невский проспект, д. 25', 12000, 3, 2, 6, 1, '["Wi-Fi","ТВ","Кондиционер","Парковка"]', 'apartment-2.jpg', 'approved', 'maria@example.com'),

('3', 'Элитная квартира с видом', 'Премиальное жильё в историческом центре города.', 'Москва', 'Тверская улица, д. 15', 18000, 2, 2, 4, 1, '["Wi-Fi","ТВ","Кондиционер","Парковка"]', 'apartment-3.jpg', 'approved', 'ivan@example.com'),

('4', 'Просторная квартира', 'C отдельными спальнями, идеально подходящая для семейного отдыха. Детская площадка во дворе.', 'Казань', 'улица Баумана, 12', 8000, 3, 2, 5, 1, '["Wi-Fi","ТВ","Кондиционер","Детская площадка"]', 'apartment-4.jpg', 'approved', 'maria@example.com');

-- Вставляем тестовые бронирования
INSERT INTO bookings (id, apartment_id, check_in, check_out, guests, total_price, status, created_by, special_requests)
VALUES 
('booking_1', '1', '2025-01-15', '2025-01-18', 2, 15000, 'completed', 'maria@example.com', 'Ранний заезд, пожалуйста'),
('booking_2', '2', '2025-02-10', '2025-02-15', 4, 60000, 'confirmed', 'ivan@example.com', NULL);

-- Вставляем тестовые отзывы
INSERT INTO reviews (id, apartment_id, booking_id, rating, comment, cleanliness, communication, location, value, created_by)
VALUES 
('review_1', '1', 'booking_1', 5, 'Отличная квартира! Всё было чисто, хозяин очень отзывчивый. Рекомендую!', 5, 5, 5, 5, 'maria@example.com');