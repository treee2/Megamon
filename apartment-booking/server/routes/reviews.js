import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить все отзывы
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM reviews ORDER BY created_date DESC');
    const reviews = stmt.all();
    res.json(reviews);
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить отзывы для конкретной квартиры
router.get('/apartment/:apartmentId', (req, res) => {
  try {
    const { apartmentId } = req.params;
    const stmt = db.prepare('SELECT * FROM reviews WHERE apartment_id = ? ORDER BY created_date DESC');
    const reviews = stmt.all(apartmentId);
    res.json(reviews);
  } catch (error) {
    console.error('Ошибка при получении отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новый отзыв
router.post('/', (req, res) => {
  try {
    const {
      apartment_id,
      booking_id,
      rating,
      comment,
      cleanliness,
      communication,
      location,
      value,
      created_by
    } = req.body;
    
    // Проверяем, не оставлен ли уже отзыв для этого бронирования
    const existingReview = db.prepare('SELECT id FROM reviews WHERE booking_id = ?').get(booking_id);
    if (existingReview) {
      return res.status(400).json({ error: 'Отзыв для этого бронирования уже существует' });
    }
    
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO reviews (
        id, apartment_id, booking_id, rating, comment,
        cleanliness, communication, location, value, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id, apartment_id, booking_id, rating, comment,
      cleanliness, communication, location, value, created_by
    );
    
    const newReview = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    res.status(201).json(newReview);
  } catch (error) {
    console.error('Ошибка при создании отзыва:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;