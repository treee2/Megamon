import TelegramBot from 'node-telegram-bot-api';

const token = '8089063071:AAFy5UWUkEFLyJjsBcv79Q6XttLxHTBSzNE'; // Получите у @BotFather
const bot = new TelegramBot(token, { polling: true });

// Для локальной разработки используйте ngrok
const webAppUrl = 'https://your-ngrok-url.ngrok.io';

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 'Добро пожаловать! Нажмите кнопку ниже:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: '🏠 Открыть каталог жилья',
            web_app: { url: webAppUrl }
          }
        ]
      ]
    }
  });
});

console.log('Бот запущен!');