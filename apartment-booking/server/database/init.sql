-- Удаляем таблицы, если они уже существуют (для чистого старта)
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS support_tickets;
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

-- Создаём таблицу оплат
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    transaction_id TEXT,
    paid_by TEXT NOT NULL,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (paid_by) REFERENCES users(email) ON DELETE CASCADE
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

-- Создаём таблицу обращений в поддержку
CREATE TABLE support_tickets (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_by TEXT NOT NULL,
    admin_response TEXT,
    responded_by TEXT,
    responded_at TEXT,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (responded_by) REFERENCES users(email) ON DELETE SET NULL
);

-- Создаём таблицу сообщений (чат)
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    apartment_id TEXT,
    booking_id TEXT,
    recipient_email TEXT NOT NULL,
    created_by TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_date TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_date TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (apartment_id) REFERENCES apartments(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(email) ON DELETE CASCADE,
    FOREIGN KEY (recipient_email) REFERENCES users(email) ON DELETE CASCADE
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

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_paid_by ON payments(paid_by);
CREATE INDEX idx_payments_status ON payments(status);

CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_created_by ON support_tickets(created_by);

CREATE INDEX idx_messages_apartment ON messages(apartment_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_email);
CREATE INDEX idx_messages_created_by ON messages(created_by);
CREATE INDEX idx_messages_is_read ON messages(is_read);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_login ON users(login);
CREATE INDEX idx_users_role ON users(role);

-- Вставляем тестовых пользователей (все НЕ заблокированы)
-- Пароль для всех: password123 (в реальном приложении нужно хешировать!)
INSERT INTO users (id, login, password, email, full_name, phone, preferences, profile_completed, role, avatar, is_blocked)
VALUES 
('user_1', 'admin', 'password123', 'admin@example.com', 'Администратор Системы', '+7 (999) 000-00-00', '{"smoking":false,"pets":false,"early_checkin":false}', 1, 'admin', NULL, 0),
('user_2', 'ivan.petrov', 'password123', 'ivan@example.com', 'Иван Петров', '+7 (999) 123-45-67', '{"smoking":false,"pets":false,"early_checkin":true}', 1, 'user', NULL, 0),
('user_3', 'maria.ivanova', 'password123', 'maria@example.com', 'Мария Иванова', '+7 (999) 234-56-78', '{"smoking":false,"pets":true,"early_checkin":false}', 1, 'user', NULL, 0);

-- Вставляем тестовые данные квартир с корректными image_url
INSERT INTO apartments (id, title, description, city, address, price_per_night, bedrooms, bathrooms, max_guests, is_available, amenities, image_url, moderation_status, created_by)
VALUES 
('apt_1', 'Уютная студия в центре', 'Современная квартира с прекрасным видом на город. Идеально подходит для одного или двух человек.', 'Москва', 'ул. Пушкина, д. 10', 5000, 1, 1, 2, 1, '["Wi-Fi","ТВ","Кондиционер"]', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'approved', 'ivan@example.com'),

('apt_2', 'Просторные апартаменты', 'Роскошная квартира для семейного отдыха с тремя спальнями и современной кухней.', 'Санкт-Петербург', 'Невский проспект, д. 25', 12000, 3, 2, 6, 1, '["Wi-Fi","ТВ","Кондиционер","Парковка"]', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'approved', 'maria@example.com'),

('apt_3', 'Элитная квартира с видом', 'Премиальное жильё в историческом центре города.', 'Москва', 'Тверская улица, д. 15', 18000, 2, 2, 4, 1, '["Wi-Fi","ТВ","Кондиционер","Парковка"]', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'approved', 'ivan@example.com'),
('apt_4', 'Просторная квартира', 'C отдельными спальнями, идеально подходящая для семейного отдыха. Детская площадка во дворе.', 'Казань', 'улица Баумана, 12', 8000, 3, 2, 5, 1, '["Wi-Fi","ТВ","Кондиционер","Детская площадка"]', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', 'approved', 'maria@example.com'),
('apt_5', 'Современная квартира-студия', 'Идеально подходит для деловых поездок и коротких визитов.', 'Новосибирск', 'ул. Ленина, д. 5', 4500, 1, 1, 2, 1, '["Wi-Fi","ТВ","Кондиционер"]', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=1200', 'approved', 'maria@example.com'),
('apt_6', 'Квартира в историческом центре', 'Рядом с основными достопримечательностями города.', 'Екатеринбург', 'ул. Малышева, д. 20', 7000, 2, 1, 4, 1, '["Wi-Fi","ТВ","Кондиционер"]', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200', 'approved', 'maria@example.com'),
('apt_7', 'Уютная квартира у моря', 'Идеально подходит для отдыха на пляже.', 'Сочи', 'ул. Морская, д. 30', 9000, 2, 1, 4, 0, '["Wi-Fi","ТВ","Кондиционер","Балкон с видом на море"]', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200', 'approved', 'maria@example.com'),
('apt_8', 'Квартира с панорамным видом', 'Роскошная квартира с видом на городские огни.', 'Владивосток', 'ул. Светланская, д. 45', 11000, 3, 2, 6, 1, '["Wi-Fi","ТВ","Кондиционер","Балкон с панорамным видом", "Стиральная машина"]', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200', 'approved', 'ivan@example.com');

INSERT INTO bookings (id, apartment_id, check_in, check_out, guests, total_price, status, created_by, special_requests)
VALUES
('booking_1', 'apt_1', '2025-01-15', '2025-01-18', 2, 15000, 'completed', 'maria@example.com', 'Ранний заезд, пожалуйста'),
('booking_2', 'apt_2', '2025-02-10', '2025-02-15', 4, 60000, 'confirmed', 'ivan@example.com', NULL);

-- Вставляем тестовые оплаты
INSERT INTO payments (id, booking_id, amount, payment_method, status, transaction_id, paid_by)
VALUES
('payment_1', 'booking_1', 15000, 'card', 'completed', 'TXN123456', 'maria@example.com');

-- Вставляем тестовые отзывы
INSERT INTO reviews (id, apartment_id, booking_id, rating, comment, cleanliness, communication, location, value, created_by)
VALUES
('review_1', 'apt_1', 'booking_1', 5, 'Отличная квартира! Всё было чисто, хозяин очень отзывчивый. Рекомендую!', 5, 5, 5, 5, 'maria@example.com');

-- Вставляем тестовые обращения
INSERT INTO support_tickets (id, subject, message, status, created_by, admin_response, responded_by, responded_at)
VALUES
('ticket_1', 'Проблема с оплатой', 'Не удаётся оплатить бронирование, выдаёт ошибку', 'closed', 'maria@example.com', 'Мы проверили платёж и всё исправили. Попробуйте ещё раз.', 'admin@example.com', '2024-11-01T10:30:00.000Z'),
('ticket_2', 'Вопрос по бронированию', 'Когда подтвердят моё бронирование?', 'in_progress', 'ivan@example.com', NULL, NULL, NULL);