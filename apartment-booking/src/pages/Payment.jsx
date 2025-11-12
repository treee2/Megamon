import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
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

export default function Payment() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const bookingId = urlParams.get('bookingId');

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Автоматически перенаправляем если нет ID
  useEffect(() => {
    if (!bookingId) {
      navigate(createPageUrl("MyBookings"));
    }
  }, [bookingId, navigate]);

  const { data: booking, isLoading: bookingLoading } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      const bookings = await base44.entities.Booking.filter({ id: bookingId });
      return bookings[0];
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

  const createPaymentMutation = useMutation({
    mutationFn: (paymentData) => base44.entities.Payment.create(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      navigate(createPageUrl("MyBookings"));
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    await createPaymentMutation.mutateAsync({
      booking_id: bookingId,
      amount: booking.total_price,
      payment_method: paymentMethod,
      status: "completed",
      transaction_id: `TXN${Date.now()}`
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
                          <div
                            key={method.id}
                            className={`flex items-start gap-4 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                              paymentMethod === method.id
                                ? 'border-indigo-600 bg-indigo-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setPaymentMethod(method.id)}
                          >
                            <RadioGroupItem value={method.id} id={method.id} />
                            <div className="flex items-start gap-3 flex-1">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center">
                                <Icon className="w-5 h-5 text-indigo-700" />
                              </div>
                              <div>
                                <Label htmlFor={method.id} className="font-semibold text-slate-900 cursor-pointer">
                                  {method.label}
                                </Label>
                                <p className="text-sm text-slate-600 mt-1">{method.description}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {paymentMethod === "card" && (
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Данные карты</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Номер карты</Label>
                      <Input
                        id="cardNumber"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="mt-2"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cardExpiry">Срок действия</Label>
                        <Input
                          id="cardExpiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="mt-2"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardCvv">CVV</Label>
                        <Input
                          id="cardCvv"
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="123"
                          maxLength={3}
                          className="mt-2"
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

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
                    Оплатить {booking.total_price?.toLocaleString('ru-RU')} ₽
                  </>
                )}
              </Button>
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
                  <div className="flex justify-between items-center text-lg font-bold pt-3 border-t border-slate-200">
                    <span>Итого к оплате</span>
                    <span className="text-indigo-700">{booking.total_price?.toLocaleString('ru-RU')} ₽</span>
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