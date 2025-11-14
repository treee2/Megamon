import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Простая функция для генерации уникального ID
function generateId() {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Получить все сообщения
router.get('/', (req, res) => {
  try {
    const messages = db.prepare('SELECT * FROM messages ORDER BY created_date DESC').all();
    res.json(messages);
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ error: 'Не удалось получить сообщения' });
  }
});

// Получить сообщения по ID
router.get('/:id', (req, res) => {
  try {
    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Ошибка получения сообщения:', error);
    res.status(500).json({ error: 'Не удалось получить сообщение' });
  }
});

// Создать новое сообщение
router.post('/', (req, res) => {
  try {
    const { text, apartment_id, booking_id, recipient_email, created_by } = req.body;
    
    if (!text || !recipient_email || !created_by) {
      return res.status(400).json({ 
        error: 'Необходимо заполнить все обязательные поля (text, recipient_email, created_by)' 
      });
    }
    
    const id = generateId();
    
    const stmt = db.prepare(`
      INSERT INTO messages (id, text, apartment_id, booking_id, recipient_email, created_by, is_read)
      VALUES (?, ?, ?, ?, ?, ?, 0)
    `);
    
    stmt.run(id, text, apartment_id || null, booking_id || null, recipient_email, created_by);
    
    const newMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Ошибка создания сообщения:', error);
    res.status(500).json({ error: 'Не удалось создать сообщение' });
  }
});

// Обновить сообщение (например, пометить как прочитанное)
router.put('/:id', (req, res) => {
  try {
    const { is_read } = req.body;
    
    const stmt = db.prepare(`
      UPDATE messages 
      SET is_read = ?, updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const result = stmt.run(is_read ? 1 : 0, req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    const updatedMessage = db.prepare('SELECT * FROM messages WHERE id = ?').get(req.params.id);
    res.json(updatedMessage);
  } catch (error) {
    console.error('Ошибка обновления сообщения:', error);
    res.status(500).json({ error: 'Не удалось обновить сообщение' });
  }
});

// Удалить сообщение
router.delete('/:id', (req, res) => {
  try {
    const stmt = db.prepare('DELETE FROM messages WHERE id = ?');
    const result = stmt.run(req.params.id);
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    res.json({ message: 'Сообщение успешно удалено' });
  } catch (error) {
    console.error('Ошибка удаления сообщения:', error);
    res.status(500).json({ error: 'Не удалось удалить сообщение' });
  }
});

export default router;
