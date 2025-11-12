import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';

const router = express.Router();

// Эндпоинт для регистрации
router.post('/register', (req, res) => {
  try {
    const { login, password, email, full_name, phone } = req.body;
    
    // Проверяем обязательные поля
    if (!login || !password || !email || !full_name) {
      return res.status(400).json({ error: 'Необходимо заполнить все обязательные поля' });
    }
    
    // Проверяем, не существует ли уже пользователь с таким логином
    const existingLogin = db.prepare('SELECT id FROM users WHERE login = ?').get(login);
    if (existingLogin) {
      return res.status(400).json({ error: 'Пользователь с таким логином уже существует' });
    }
    
    // Проверяем, не существует ли уже пользователь с таким email
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingEmail) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Создаём нового пользователя
    const userId = generateId();
    const stmt = db.prepare(`
      INSERT INTO users (
        id, login, password, email, full_name, phone, role, profile_completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, login, password, email, full_name, phone || null, 'user', 0);
    
    // Получаем созданного пользователя
    const newUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    
    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      ...userWithoutPassword,
      preferences: {}
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Эндпоинт для входа в систему
router.post('/login', (req, res) => {
  try {
    const { login, password } = req.body;
    
    // Проверяем, заполнены ли оба поля
    if (!login || !password) {
      return res.status(400).json({ error: 'Необходимо указать логин/email и пароль' });
    }
    
    // Ищем пользователя по логину или email
    const stmt = db.prepare('SELECT * FROM users WHERE login = ? OR email = ?');
    const user = stmt.get(login, login);
    
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