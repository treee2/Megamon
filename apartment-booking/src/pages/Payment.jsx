import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import {
  CreditCard,
  Banknote,
  Building,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  MapPin,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import StripeCheckoutForm from "@/components/StripeCheckoutForm";

// Инициализация Stripe (замените на ваш публичный ключ)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function Payment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingid');

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [clientSecret, setClientSecret] = useState("");

  // Автоматически перенаправляем если нет ID
  useEffect(() => {
    if (!bookingId) {
      navigate(createPageUrl("MyBookings"));
    }
  }, [bookingId, navigate]);

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      return bookings[0] || null;
    },
    enabled: !!bookingId,
  });

  const { data: apartment, isLoading: apartmentLoading } = useQuery({
    queryKey: ['apartment', booking?.apartment_id],
    queryFn: async () => {
      const apartments = await base44.entities.Apartment.filter({ id: booking.apartment_id });
      return apartments[0];
    },
    enabled: !!booking?.apartment_id,
  });

  // Создание Payment Intent при выборе оплаты картой
  useEffect(() => {
    if (paymentMethod === "card" && booking && !clientSecret) {
      console.log('🔄 Создание Payment Intent для бронирования:', bookingId);
      createPaymentIntent();
    }
  }, [paymentMethod, booking]);

  const createPaymentIntent = async () => {
    try {
      // Добавляем комиссию 1%
      const totalWithFee = booking.total_price * 1.01;
      
      console.log('📤 Отправка запроса на создание Payment Intent');
      console.log('Booking ID:', bookingId);
      console.log('Сумма без комиссии:', booking.total_price);
      console.log('Сумма с комиссией 1%:', totalWithFee);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: bookingId,
          amount: totalWithFee,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Ошибка от сервера:', errorData);
        throw new Error(errorData.error || 'Не удалось создать Payment Intent');
      }
      
      const data = await response.json();
      console.log('✅ Payment Intent создан:', data);
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error('❌ Ошибка при создании Payment Intent:', error);
      alert('Не удалось инициализировать оплату: ' + error.message);
    }
  };

  const createPaymentMutation = useMutation({
    mutationFn: (paymentData) => base44.entities.Payment.create(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      navigate(createPageUrl("MyBookings"));
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.email) return;
    
    // Добавляем комиссию 1%
    const totalWithFee = booking.total_price * 1.01;
    
    await createPaymentMutation.mutateAsync({
      booking_id: bookingId,
      amount: totalWithFee,
      payment_method: paymentMethod,
      status: "completed",
      transaction_id: `TXN${Date.now()}`,
      paid_by: currentUser.email
    });
  };

  if (bookingLoading || apartmentLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Alert className="max-w-md bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Бронирование не найдено.
            <Button 
              variant="link" 
              className="text-amber-800 underline p-0 h-auto ml-1"
              onClick={() => navigate(createPageUrl("MyBookings"))}
            >
              Вернуться к бронированиям
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (booking.status !== "confirmed") {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Alert className="max-w-md bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            Бронирование ещё не подтверждено владельцем. Текущий статус: <strong>{booking.status === 'pending' ? 'Ожидает подтверждения' : booking.status}</strong>.
            <Button 
              variant="link" 
              className="text-amber-800 underline p-0 h-auto ml-1"
              onClick={() => navigate(createPageUrl("MyBookings"))}
            >
              Вернуться к бронированиям
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const paymentMethods = [
    {
      id: "card",
      label: "Банковская карта",
      icon: CreditCard,
      description: "Visa, MasterCard, Мир"
    },
    {
      id: "cash",
      label: "Наличные",
      icon: Banknote,
      description: "Оплата при заселении"
    },
    {
      id: "transfer",
      label: "Банковский перевод",
      icon: Building,
      description: "Перевод на счет"
    }
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("MyBookings"))}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к бронированиям
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Оплата бронирования
          </h1>
          <p className="text-slate-600 text-lg">
            Завершите оплату для подтверждения бронирования
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Способ оплаты</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="space-y-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon;
                        return (
                          <Label
                            key={method.id}
                            htmlFor={method.id}
                            className={`flex items-start gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              paymentMethod === method.id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-indigo-700" />
                              </div>
                              <div>
                                <span className="font-semibold text-slate-900">
                                  {method.label}
                                </span>
                                <p className="text-sm text-slate-600 mt-1">{method.description}</p>
                              </div>
                            </div>
                          </Label>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {paymentMethod === "card" && clientSecret && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Данные карты</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeCheckoutForm 
                        bookingId={bookingId} 
                        amount={booking.total_price * 1.01}
                        onSuccess={() => navigate(createPageUrl("MyBookings"))}
                      />
                    </Elements>
                  </CardContent>
                </Card>
              )}

              {paymentMethod !== "card" && (
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-6 text-lg shadow-lg shadow-indigo-500/30"
                  disabled={createPaymentMutation.isPending}
                >
                  {createPaymentMutation.isPending ? (
                    "Обработка..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Подтвердить {paymentMethod === 'cash' ? 'оплату наличными' : 'банковский перевод'}
                    </>
                  )}
                </Button>
              )}
            </form>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Детали бронирования</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apartment && (
                  <>
                    <div className="relative h-48 rounded-xl overflow-hidden">
                      <img
                        src={apartment.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                        alt={apartment.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-900 mb-2">{apartment.title}</h3>
                      {apartment.address && (
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <MapPin className="w-4 h-4" />
                          <span>{apartment.city}, {apartment.address}</span>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <div className="space-y-3 pt-4 border-t border-slate-200">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-slate-500">Заезд</p>
                      <p className="font-semibold text-slate-900">
                        {format(new Date(booking.check_in), "d MMMM yyyy", { locale: ru })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="text-slate-500">Выезд</p>
                      <p className="font-semibold text-slate-900">
                        {format(new Date(booking.check_out), "d MMMM yyyy", { locale: ru })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Статус</span>
                    <Badge className="bg-green-100 text-green-800">Подтверждено</Badge>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Стоимость бронирования</span>
                    <span>{booking.total_price?.toLocaleString('ru-RU')} ₽</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Комиссия сервиса (1%)</span>
                    <span>{(booking.total_price * 0.01).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-slate-200">
                    <span>Итого к оплате</span>
                    <span className="text-indigo-700">{(booking.total_price * 1.01).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}