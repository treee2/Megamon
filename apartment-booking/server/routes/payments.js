import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить список оплат
router.get('/', (req, res) => {
  try {
    const { booking_id, status, paid_by } = req.query;
    const filters = [];
    const values = [];

    if (booking_id) {
      filters.push('booking_id = ?');
      values.push(booking_id);
    }

    if (status) {
      filters.push('status = ?');
      values.push(status);
    }

    if (paid_by) {
      filters.push('paid_by = ?');
      values.push(paid_by);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const stmt = db.prepare(`
      SELECT * FROM payments
      ${whereClause}
      ORDER BY created_date DESC
    `);

    const payments = stmt.all(...values);
    res.json(payments);
  } catch (error) {
    console.error('Ошибка при получении оплат:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить оплату по ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM payments WHERE id = ?');
    const payment = stmt.get(id);

    if (!payment) {
      return res.status(404).json({ error: 'Оплата не найдена' });
    }

    res.json(payment);
  } catch (error) {
    console.error('Ошибка при получении оплаты:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать оплату
router.post('/', (req, res) => {
  try {
    const {
      booking_id,
      amount,
      payment_method,
      status = 'pending',
      transaction_id,
      paid_by
    } = req.body;

    if (!booking_id || !amount || !payment_method || !paid_by) {
      return res.status(400).json({
        error: 'Необходимо указать booking_id, amount, payment_method и paid_by'
      });
    }

    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    const paymentId = generateId('payment');

    const stmt = db.prepare(`
      INSERT INTO payments (
        id, booking_id, amount, payment_method, status, transaction_id, paid_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      paymentId,
      booking_id,
      amount,
      payment_method,
      status,
      transaction_id || null,
      paid_by
    );

    if (status === 'completed') {
      db.prepare(`
        UPDATE bookings SET status = 'completed', updated_date = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(booking_id);
    }

    const newPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId);
    res.status(201).json(newPayment);
  } catch (error) {
    console.error('Ошибка при создании оплаты:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

export default router;
