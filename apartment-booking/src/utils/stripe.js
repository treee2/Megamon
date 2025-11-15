import { loadStripe } from '@stripe/stripe-js';

// Замените на ваш публичный ключ Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key_here');

export default stripePromise;
