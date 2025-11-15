// import express from 'express';
// import db from '../database/db.js';

// const router = express.Router();

// // Получить настройки Telegram бота
// router.get('/settings', async (req, res) => {
//   try {
//     const [settings] = await db.query(
//       'SELECT bot_token, webhook_url, notifications_enabled FROM telegram_settings WHERE id = 1'
//     );
    
//     if (settings.length === 0) {
//       return res.json({
//         bot_token: null,
//         webhook_url: null,
//         notifications_enabled: false
//       });
//     }
    
//     res.json(settings[0]);
//   } catch (error) {
//     console.error('Ошибка при получении настроек Telegram:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// // Обновить настройки Telegram бота
// router.post('/settings', async (req, res) => {
//   try {
//     const { bot_token, webhook_url, notifications_enabled } = req.body;
    
//     const [existing] = await db.query('SELECT id FROM telegram_settings WHERE id = 1');
    
//     if (existing.length === 0) {
//       await db.query(
//         'INSERT INTO telegram_settings (id, bot_token, webhook_url, notifications_enabled) VALUES (1, ?, ?, ?)',
//         [bot_token, webhook_url, notifications_enabled ? 1 : 0]
//       );
//     } else {
//       await db.query(
//         'UPDATE telegram_settings SET bot_token = ?, webhook_url = ?, notifications_enabled = ? WHERE id = 1',
//         [bot_token, webhook_url, notifications_enabled ? 1 : 0]
//       );
//     }
    
//     res.json({ message: 'Настройки Telegram обновлены' });
//   } catch (error) {
//     console.error('Ошибка при обновлении настроек Telegram:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// // Получить список подписчиков
// router.get('/subscribers', async (req, res) => {
//   try {
//     const [subscribers] = await db.query(
//       'SELECT chat_id, username, first_name, last_name, subscribed_at FROM telegram_subscribers WHERE is_active = 1 ORDER BY subscribed_at DESC'
//     );
    
//     res.json(subscribers);
//   } catch (error) {
//     console.error('Ошибка при получении подписчиков:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// // Добавить подписчика (вызывается ботом)
// router.post('/subscribe', async (req, res) => {
//   try {
//     const { chat_id, username, first_name, last_name } = req.body;
    
//     if (!chat_id) {
//       return res.status(400).json({ error: 'chat_id обязателен' });
//     }
    
//     // Проверяем, существует ли подписчик
//     const [existing] = await db.query(
//       'SELECT id FROM telegram_subscribers WHERE chat_id = ?',
//       [chat_id]
//     );
    
//     if (existing.length > 0) {
//       // Обновляем существующего подписчика
//       await db.query(
//         'UPDATE telegram_subscribers SET username = ?, first_name = ?, last_name = ?, is_active = 1, subscribed_at = NOW() WHERE chat_id = ?',
//         [username, first_name, last_name, chat_id]
//       );
//     } else {
//       // Добавляем нового подписчика
//       await db.query(
//         'INSERT INTO telegram_subscribers (chat_id, username, first_name, last_name, is_active, subscribed_at) VALUES (?, ?, ?, ?, 1, NOW())',
//         [chat_id, username, first_name, last_name]
//       );
//     }
    
//     res.json({ message: 'Подписка оформлена' });
//   } catch (error) {
//     console.error('Ошибка при добавлении подписчика:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// // Отписать пользователя
// router.post('/unsubscribe', async (req, res) => {
//   try {
//     const { chat_id } = req.body;
    
//     if (!chat_id) {
//       return res.status(400).json({ error: 'chat_id обязателен' });
//     }
    
//     await db.query(
//       'UPDATE telegram_subscribers SET is_active = 0 WHERE chat_id = ?',
//       [chat_id]
//     );
    
//     res.json({ message: 'Подписка отменена' });
//   } catch (error) {
//     console.error('Ошибка при отписке:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// // Отправить уведомление всем подписчикам
// router.post('/broadcast', async (req, res) => {
//   try {
//     const { message } = req.body;
    
//     if (!message) {
//       return res.status(400).json({ error: 'Сообщение обязательно' });
//     }
    
//     // Получаем bot_token
//     const [settings] = await db.query(
//       'SELECT bot_token FROM telegram_settings WHERE id = 1'
//     );
    
//     if (settings.length === 0 || !settings[0].bot_token) {
//       return res.status(400).json({ error: 'Токен бота не настроен' });
//     }
    
//     const bot_token = settings[0].bot_token;
    
//     // Получаем всех активных подписчиков
//     const [subscribers] = await db.query(
//       'SELECT chat_id FROM telegram_subscribers WHERE is_active = 1'
//     );
    
//     // Отправляем сообщения
//     const results = [];
//     for (const subscriber of subscribers) {
//       try {
//         const response = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             chat_id: subscriber.chat_id,
//             text: message,
//             parse_mode: 'HTML'
//           })
//         });
        
//         const data = await response.json();
//         results.push({ chat_id: subscriber.chat_id, success: data.ok });
//       } catch (error) {
//         results.push({ chat_id: subscriber.chat_id, success: false, error: error.message });
//       }
//     }
    
//     res.json({ 
//       message: 'Рассылка завершена',
//       total: subscribers.length,
//       results 
//     });
//   } catch (error) {
//     console.error('Ошибка при рассылке:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// // Webhook для получения обновлений от Telegram
// router.post('/webhook', async (req, res) => {
//   try {
//     const update = req.body;
    
//     // Логируем обновление
//     console.log('Telegram webhook update:', JSON.stringify(update));
    
//     if (update.message) {
//       const chat_id = update.message.chat.id;
//       const text = update.message.text;
//       const username = update.message.from.username;
//       const first_name = update.message.from.first_name;
//       const last_name = update.message.from.last_name;
      
//       // Обработка команд
//       if (text === '/start') {
//         // Автоматическая подписка при старте
//         await fetch(`${req.protocol}://${req.get('host')}/api/telegram/subscribe`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ chat_id, username, first_name, last_name })
//         });
//       }
//     }
    
//     res.json({ ok: true });
//   } catch (error) {
//     console.error('Ошибка при обработке webhook:', error);
//     res.status(500).json({ error: 'Ошибка сервера' });
//   }
// });

// export default router;
