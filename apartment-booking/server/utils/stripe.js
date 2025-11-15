import Stripe from 'stripe';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загружаем .env из папки server
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

// Инициализация Stripe с вашим секретным ключом
const stripeKey = process.env.STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.error('⚠️  STRIPE_SECRET_KEY не найден в .env файле!');
  console.error('Создайте файл .env в папке server/ и добавьте:');
  console.error('STRIPE_SECRET_KEY=sk_test_ваш_ключ');
  console.error(`Текущий путь: ${path.resolve(__dirname, '..', '.env')}`);
  process.exit(1);
}

console.log('✅ Stripe инициализирован успешно');

const stripe = new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia',
});

export default stripe;
