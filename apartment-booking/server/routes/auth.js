import express from 'express';
import db from '../database/db.js';

const router = express.Router();

// Эндпоинт для входа в систему
// В реальном приложении пароли должны быть захешированы с помощью bcrypt!
router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body;
    
    // Проверяем, заполнены ли оба поля
    if (!login || !password) {
      return res.status(400).json({ error: 'Необходимо указать логин и пароль' });
    }
    
    // Ищем пользователя по логину
    const stmt = db.prepare('SELECT * FROM users WHERE login = ?');
    const user = stmt.get(login);
    
    // Проверяем существование пользователя
    if (!user) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // Проверяем блокировку пользователя
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован. Обратитесь к администратору.' });
    }
    
    // В реальном приложении здесь была бы проверка хешированного пароля
    // Например: const isPasswordValid = await bcrypt.compare(password, user.password);
    if (user.password !== password) {
      return res.status(401).json({ error: 'Неверный логин или пароль' });
    }
    
    // Убираем пароль из ответа (никогда не отправляем пароли клиенту!)
    const { password: _, ...userWithoutPassword } = user;
    
    // Парсим JSON-поля
    const userResponse = {
      ...userWithoutPassword,
      preferences: user.preferences ? JSON.parse(user.preferences) : {}
    };
    
    res.json(userResponse);
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для получения текущего пользователя по email
router.get('/user/:email', (req, res) => {
  try {
    const { email } = req.params;
    
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

export default router;