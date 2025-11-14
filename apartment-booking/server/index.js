import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './database/db.js';
import apartmentsRouter from './routes/apartments.js';
import bookingsRouter from './routes/bookings.js';
import usersRouter from './routes/users.js';
import authRouter from './routes/auth.js';
import reviewsRouter from './routes/reviews.js';
import supportTicketsRouter from './routes/supportTickets.js';
import paymentsRouter from './routes/payments.js';
import messagesRouter from './routes/messages.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаём приложение Express
const app = express();
const PORT = process.env.PORT || 3001;

// Инициализируем базу данных при запуске сервера
initDatabase();

// Настраиваем CORS для Railway
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ВАЖНО: Увеличиваем лимит размера запроса для загрузки изображений
// 50mb - это достаточно для большинства изображений в base64
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Подключаем маршруты API
app.use('/api/auth', authRouter);
app.use('/api/apartments', apartmentsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/users', usersRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/support-tickets', supportTicketsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/messages', messagesRouter);

// Простой тестовый маршрут для проверки работы сервера
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает!',
    timestamp: new Date().toISOString()
  });
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════');
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}/api`);
  console.log('');
  console.log('Доступные endpoints:');
  console.log(`  🔐 POST /api/auth/login           - Вход в систему`);
  console.log(`  📋 GET  /api/apartments          - Список квартир`);
  console.log(`  ➕ POST /api/apartments          - Создать квартиру`);
  console.log(`  👤 GET  /api/users/me            - Текущий пользователь`);
  console.log(`  ✏️  PUT  /api/users/me            - Обновить профиль`);
  console.log(`  📅 GET  /api/bookings            - Список бронирований`);
  console.log(`  ➕ POST /api/bookings            - Создать бронирование`);
  console.log(`  ⭐ GET  /api/reviews             - Список отзывов`);
  console.log(`  ➕ POST /api/reviews             - Создать отзыв`);
  console.log(`  🆘 GET  /api/support-tickets    - Обращения в поддержку`);
  console.log(`  ➕ POST /api/support-tickets    - Создать обращение`);
  console.log(`  💳 GET  /api/payments           - Список оплат`);
  console.log(`  ➕ POST /api/payments           - Создать оплату`);
  console.log(`  💬 GET  /api/messages           - Список сообщений`);
  console.log(`  ➕ POST /api/messages           - Отправить сообщение`);
  console.log('═══════════════════════════════════════════════');
});