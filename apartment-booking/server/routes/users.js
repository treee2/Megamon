// Получить текущего пользователя
// В реальном приложении здесь бы была аутентификация через JWT токены
// Пока мы возвращаем тестового пользователя
// В реальном приложении ID брался бы из токена аутентификации
// Сейчас обновляем первого пользователя

import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Получить текущего пользователя по email
router.get('/me', (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email не указан' });
    }
    
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    const user = stmt.get(email);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      ...userWithoutPassword,
      preferences: user.preferences ? JSON.parse(user.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить профиль текущего пользователя
router.put('/me', (req, res) => {
  try {
    const {
      email,
      phone,
      date_of_birth,
      address,
      passport_series,
      passport_number,
      passport_issued_by,
      passport_issue_date,
      preferences,
      profile_completed
    } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email не указан' });
    }
    
    const currentUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    
    if (!currentUser) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    const preferencesJson = preferences ? JSON.stringify(preferences) : null;
    
    const stmt = db.prepare(`
      UPDATE users SET
        phone = ?,
        date_of_birth = ?,
        address = ?,
        passport_series = ?,
        passport_number = ?,
        passport_issued_by = ?,
        passport_issue_date = ?,
        preferences = ?,
        profile_completed = ?,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      phone,
      date_of_birth,
      address,
      passport_series,
      passport_number,
      passport_issued_by,
      passport_issue_date,
      preferencesJson,
      profile_completed ? 1 : 0,
      currentUser.id
    );
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(currentUser.id);
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({
      ...userWithoutPassword,
      preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при обновлении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить всех пользователей (для административных целей)
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM users ORDER BY created_date DESC');
    const users = stmt.all();
    
    const processedUsers = users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return {
        ...userWithoutPassword,
        preferences: user.preferences ? JSON.parse(user.preferences) : {}
      };
    });
    
    res.json(processedUsers);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить пользователя по ID (для модерации)
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { is_blocked, role } = req.body;
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    // Обновляем только разрешенные поля
    const updates = [];
    const values = [];
    
    if (is_blocked !== undefined) {
      updates.push('is_blocked = ?');
      values.push(is_blocked ? 1 : 0);
    }
    
    if (role !== undefined) {
      updates.push('role = ?');
      values.push(role);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    updates.push('updated_date = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = db.prepare(`
      UPDATE users SET ${updates.join(', ')}
      WHERE id = ?
    `);
    
    stmt.run(...values);
    
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    const { password: _, ...userWithoutPassword } = updatedUser;
    
    res.json({
      ...userWithoutPassword,
      preferences: updatedUser.preferences ? JSON.parse(updatedUser.preferences) : {}
    });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;