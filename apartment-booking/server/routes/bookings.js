import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить все бронирования
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM bookings ORDER BY created_date DESC');
    const bookings = stmt.all();
    res.json(bookings);
  } catch (error) {
    console.error('Ошибка при получении бронирований:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить бронирование по ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM bookings WHERE id = ?');
    const booking = stmt.get(id);
    
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Ошибка при получении бронирования:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новое бронирование
router.post('/', (req, res) => {
  try {
    const {
      apartment_id,
      check_in,
      check_out,
      guests,
      total_price,
      special_requests,
      status = 'pending',
      created_by // Добавляем поле created_by
    } = req.body;
    
    // Проверяем обязательные поля
    if (!apartment_id || !check_in || !check_out || !guests || !created_by) {
      return res.status(400).json({ 
        error: 'Необходимо заполнить все обязательные поля (apartment_id, check_in, check_out, guests, created_by)' 
      });
    }
    
    const id = generateId();
    
    // Проверяем, доступна ли квартира в выбранные даты
    const conflictCheck = db.prepare(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE apartment_id = ? 
      AND status != 'cancelled'
      AND (
        (check_in <= ? AND check_out >= ?) OR
        (check_in <= ? AND check_out >= ?) OR
        (check_in >= ? AND check_out <= ?)
      )
    `).get(apartment_id, check_out, check_in, check_in, check_in, check_in, check_out);
    
    if (conflictCheck.count > 0) {
      return res.status(400).json({ error: 'Квартира уже забронирована на эти даты' });
    }
    
    // Вставляем новое бронирование
    const stmt = db.prepare(`
      INSERT INTO bookings (
        id, apartment_id, check_in, check_out, guests, total_price,
        special_requests, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      id,
      apartment_id,
      check_in,
      check_out,
      guests,
      total_price,
      special_requests || null,
      status,
      created_by
    );
    
    const newBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Обновить бронирование
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, special_requests } = req.body;
    
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }
    
    const updates = [];
    const values = [];
    
    if (status !== undefined) {
      updates.push('status = ?');
      values.push(status);
    }
    
    if (special_requests !== undefined) {
      updates.push('special_requests = ?');
      values.push(special_requests);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    updates.push('updated_date = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE bookings SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    const updatedBooking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(id);
    res.json(updatedBooking);
  } catch (error) {
    console.error('Ошибка при обновлении бронирования:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;