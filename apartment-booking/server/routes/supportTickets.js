import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить список обращений в поддержку
router.get('/', (req, res) => {
  try {
    const { status, created_by } = req.query;
    const filters = [];
    const values = [];

    if (status) {
      filters.push('status = ?');
      values.push(status);
    }

    if (created_by) {
      filters.push('created_by = ?');
      values.push(created_by);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const stmt = db.prepare(`
      SELECT * FROM support_tickets
      ${whereClause}
      ORDER BY created_date DESC
    `);

    const tickets = stmt.all(...values);
    res.json(tickets);
  } catch (error) {
    console.error('Ошибка при получении обращений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить обращение по ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM support_tickets WHERE id = ?');
    const ticket = stmt.get(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Обращение не найдено' });
    }

    res.json(ticket);
  } catch (error) {
    console.error('Ошибка при получении обращения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать новое обращение
router.post('/', (req, res) => {
  try {
    const { subject, message, created_by, status = 'open' } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ error: 'Необходимо указать тему и сообщение' });
    }

    const ticketCreator = created_by || 'anonymous@example.com';
    const id = generateId('ticket');

    const stmt = db.prepare(`
      INSERT INTO support_tickets (
        id, subject, message, status, created_by
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, subject, message, status, ticketCreator);

    const newTicket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Ошибка при создании обращения:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
  }
});

// Обновить обращение
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Обращение не найдено' });
    }

    const updates = [];
    const values = [];

    Object.entries(updateData).forEach(([key, value]) => {
      if (['subject', 'message', 'status', 'admin_response', 'responded_by', 'responded_at', 'created_by'].includes(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updates.push('updated_date = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE support_tickets SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...values);

    const updatedTicket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
    res.json(updatedTicket);
  } catch (error) {
    console.error('Ошибка при обновлении обращения:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;
