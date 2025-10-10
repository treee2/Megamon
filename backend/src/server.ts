import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(cors({
  origin: 'http://localhost:5173', // порт Vite
  credentials: true
}));
app.use(express.json());

// Главная страница - для проверки что сервер работает
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Backend для Telegram Mini App - Аренда жилья',
    version: '1.0.0',
    endpoints: {
      properties: 'GET /api/properties',
      property: 'GET /api/properties/:id',
      bookings: 'POST /api/bookings',
      userBookings: 'GET /api/bookings/:telegramId',
      favorites: 'POST /api/favorites'
    }
  });
});

// Получить все объявления
app.get('/api/properties', async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    const propertiesWithImages = properties.map(p => ({
      ...p,
      images: JSON.parse(p.images)
    }));
    
    res.json(propertiesWithImages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить одно объявление
app.get('/api/properties/:id', async (req, res) => {
  try {
    const property = await prisma.property.findUnique({
      where: { id: parseInt(req.params.id) }
    });
    
    if (!property) {
      return res.status(404).json({ error: 'Не найдено' });
    }
    
    res.json({
      ...property,
      images: JSON.parse(property.images)
    });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать бронирование
app.post('/api/bookings', async (req, res) => {
  try {
    const { telegramId, propertyId, checkIn, checkOut, firstName, username } = req.body;
    
    // Валидация дат
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ error: 'Неверный формат даты' });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ error: 'Дата выезда должна быть позже даты заезда' });
    }
    
    let user = await prisma.user.findUnique({
      where: { telegramId }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { telegramId, firstName, username }
      });
    }
    
    const booking = await prisma.booking.create({
      data: {
        userId: user.id,
        propertyId: parseInt(propertyId),
        checkIn: checkInDate,
        checkOut: checkOutDate,
        status: 'confirmed'
      },
      include: {
        property: true
      }
    });
    
    res.json({
      ...booking,
      property: {
        ...booking.property,
        images: JSON.parse(booking.property.images)
      }
    });
  } catch (error) {
    console.error('Ошибка создания бронирования:', error);
    res.status(500).json({ error: 'Ошибка создания бронирования' });
  }
});

// Получить бронирования пользователя
app.get('/api/bookings/:telegramId', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { telegramId: req.params.telegramId }
    });
    
    if (!user) {
      return res.json([]);
    }
    
    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      include: { property: true },
      orderBy: { createdAt: 'desc' }
    });
    
    const bookingsWithImages = bookings.map(b => ({
      ...b,
      property: {
        ...b.property,
        images: JSON.parse(b.property.images)
      }
    }));
    
    res.json(bookingsWithImages);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить в избранное
app.post('/api/favorites', async (req, res) => {
  try {
    const { telegramId, propertyId } = req.body;
    
    let user = await prisma.user.findUnique({
      where: { telegramId }
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: { telegramId }
      });
    }
    
    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        propertyId: parseInt(propertyId)
      }
    });
    
    res.json(favorite);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка добавления в избранное' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
  console.log(`📋 API документация: http://localhost:${PORT}`);
  console.log(`🏠 Объявления: http://localhost:${PORT}/api/properties`);
});

