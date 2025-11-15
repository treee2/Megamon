import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env
dotenv.config({ path: path.resolve(__dirname, '.env') });

console.log('\n🔍 Проверка переменных окружения для Stripe\n');
console.log('=' .repeat(60));

const envPath = path.resolve(__dirname, '.env');
console.log(`📁 Путь к .env файлу: ${envPath}`);
console.log(`📄 Файл существует: ${fs.existsSync(envPath) ? '✅ Да' : '❌ Нет'}`);

console.log('\n💳 Stripe конфигурация:');
console.log('-'.repeat(60));

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripePublishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

if (stripeSecretKey) {
  console.log(`✅ STRIPE_SECRET_KEY найден: ${stripeSecretKey.substring(0, 12)}...`);
} else {
  console.log('❌ STRIPE_SECRET_KEY НЕ НАЙДЕН!');
}

if (stripePublishableKey) {
  console.log(`✅ STRIPE_PUBLISHABLE_KEY найден: ${stripePublishableKey.substring(0, 12)}...`);
} else {
  console.log('⚠️  STRIPE_PUBLISHABLE_KEY не найден (нужен только для фронтенда)');
}

console.log('\n🌐 Другие настройки:');
console.log('-'.repeat(60));
console.log(`PORT: ${process.env.PORT || 'не установлен'}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'не установлен'}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL || 'не установлен'}`);

console.log('\n' + '='.repeat(60));

if (!stripeSecretKey) {
  console.log('\n⚠️  Для работы Stripe необходимо добавить в server/.env:');
  console.log('STRIPE_SECRET_KEY=sk_test_ваш_секретный_ключ');
  console.log('\nПолучить ключи можно здесь: https://dashboard.stripe.com/apikeys');
}

console.log('\n');
