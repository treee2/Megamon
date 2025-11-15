import express from 'express';
import db from '../database/db.js';
import { generateId } from '../utils/helpers.js';
import stripe from '../utils/stripe.js';

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

// Создать намерение оплаты Stripe (Payment Intent)
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { booking_id, amount } = req.body;

    if (!booking_id || !amount) {
      return res.status(400).json({
        error: 'Необходимо указать booking_id и amount'
      });
    }

    // Проверяем существование бронирования
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
    if (!booking) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    // Создаем Payment Intent в Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe работает с копейками/центами
      currency: 'rub',
      metadata: {
        booking_id: booking_id,
        user_email: booking.created_by
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Ошибка при создании Payment Intent:', error);
    res.status(500).json({ error: 'Ошибка сервера: ' + error.message });
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

// Webhook для обработки событий Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Ошибка webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Обработка событий
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent успешно завершен:', paymentIntent.id);
      
      // Обновляем статус оплаты в БД
      const bookingId = paymentIntent.metadata.booking_id;
      if (bookingId) {
        try {
          const paymentId = generateId('payment');
          
          db.prepare(`
            INSERT INTO payments (
              id, booking_id, amount, payment_method, status, transaction_id, paid_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(
            paymentId,
            bookingId,
            paymentIntent.amount / 100,
            'card',
            'completed',
            paymentIntent.id,
            paymentIntent.metadata.user_email
          );

          db.prepare(`
            UPDATE bookings SET status = 'completed', updated_date = CURRENT_TIMESTAMP
            WHERE id = ?
          `).run(bookingId);
        } catch (error) {
          console.error('Ошибка при обновлении оплаты:', error);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Оплата не удалась:', failedPayment.id);
      break;

    default:
      console.log(`Необработанный тип события: ${event.type}`);
  }

  res.json({ received: true });
});

export default router;
