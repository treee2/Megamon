import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';

export default function StripeCheckoutForm({ bookingId, amount, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.warn('⚠️ Stripe еще не загружен');
      return;
    }

    setIsLoading(true);
    console.log('🔄 Начало процесса оплаты...');

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/my-bookings`,
      },
      redirect: 'if_required',
    });

    if (error) {
      console.error('❌ Ошибка оплаты:', error);
      setMessage(error.message);
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      console.log('✅ Оплата успешна:', paymentIntent);
      setMessage('Оплата прошла успешно!');
      
      // Сохраняем информацию об оплате в базу данных
      try {
        const currentUser = await base44.auth.me();
        await base44.entities.Payment.create({
          booking_id: bookingId,
          amount: amount,
          payment_method: 'card',
          status: 'completed',
          transaction_id: paymentIntent.id,
          paid_by: currentUser.email
        });
        
        console.log('✅ Информация об оплате сохранена в БД');
      } catch (dbError) {
        console.error('⚠️ Ошибка при сохранении в БД:', dbError);
      }
      
      setIsLoading(false);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } else {
      console.log('⏳ Статус оплаты:', paymentIntent?.status);
      setMessage('Оплата обрабатывается...');
      setIsLoading(false);
    }
  };

  const paymentElementOptions = {
    layout: 'tabs',
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement id="payment-element" options={paymentElementOptions} />
      
      {message && (
        <Alert className={message.includes('успешно') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
          <AlertDescription className={message.includes('успешно') ? 'text-green-800' : 'text-red-800'}>
            {message}
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-6 text-lg shadow-lg shadow-indigo-500/30"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Обработка...
          </>
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Оплатить {amount?.toLocaleString('ru-RU')} ₽
          </>
        )}
      </Button>
    </form>
  );
}
