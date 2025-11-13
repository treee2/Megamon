import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bed,
  Bath,
  Users,
  MapPin,
  Wifi,
  Tv,
  Wind,
  Car,
  CalendarIcon,
  CheckCircle2,
  AlertCircle,
  MessageSquare
} from "lucide-react";
import { format, differenceInDays, isWithinInterval, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import ReviewCard from "../components/reviews/ReviewCard";
import ChatWindow from "../components/chat/ChatWindow";

const amenityIcons = {
  "Wi-Fi": Wifi,
  "ТВ": Tv,
  "Кондиционер": Wind,
  "Парковка": Car,
};

export default function ApartmentDetails() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const apartmentId = urlParams.get('id');

  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: apartment, isLoading } = useQuery({
    queryKey: ['apartment', apartmentId],
    queryFn: async () => {
      const apartments = await base44.entities.Apartment.filter({ id: apartmentId });
      return apartments[0];
    },
    enabled: !!apartmentId,
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['reviews', apartmentId],
    queryFn: async () => {
      return await base44.entities.Review.filter({ apartment_id: apartmentId });
    },
    enabled: !!apartmentId,
    initialData: [],
  });

  // Загружаем все бронирования для этой квартиры
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings', apartmentId],
    queryFn: async () => {
      const allBookings = await base44.entities.Booking.filter({ apartment_id: apartmentId });
      // Фильтруем только подтвержденные бронирования
      return allBookings.filter(b => b.status === "confirmed" || b.status === "pending");
    },
    enabled: !!apartmentId,
    initialData: [],
  });

  // Загружаем владельца квартиры
  const { data: owner } = useQuery({
    queryKey: ['owner', apartment?.created_by],
    queryFn: async () => {
      if (!apartment?.created_by) return null;
      const users = await base44.entities.User.filter({ email: apartment.created_by });
      return users[0];
    },
    enabled: !!apartment?.created_by,
  });

  const createBookingMutation = useMutation({
    mutationFn: (bookingData) => base44.entities.Booking.create(bookingData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      navigate(createPageUrl("MyBookings"));
    },
  });

  // Проверка доступности дат
  const isDateRangeAvailable = (startDate, endDate) => {
    if (!startDate || !endDate || !bookings) return true;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Проверяем пересечение с существующими бронированиями
    return !bookings.some(booking => {
      const bookingStart = parseISO(booking.check_in);
      const bookingEnd = parseISO(booking.check_out);

      // Проверяем пересечение дат
      return (
        (start >= bookingStart && start < bookingEnd) ||
        (end > bookingStart && end <= bookingEnd) ||
        (start <= bookingStart && end >= bookingEnd)
      );
    });
  };

  // Проверка при изменении дат
  const datesAvailable = checkIn && checkOut ? isDateRangeAvailable(checkIn, checkOut) : true;

  const calculateTotalPrice = () => {
    if (!checkIn || !checkOut || !apartment) return 0;
    const nights = differenceInDays(new Date(checkOut), new Date(checkIn));
    return nights * apartment.price_per_night;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut || !datesAvailable || !user?.email) return;

    await createBookingMutation.mutateAsync({
      apartment_id: apartmentId,
      check_in: format(checkIn, 'yyyy-MM-dd'),
      check_out: format(checkOut, 'yyyy-MM-dd'),
      guests,
      total_price: calculateTotalPrice(),
      special_requests: specialRequests,
      created_by: user.email,
      status: "pending"
    });
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  if (isLoading || bookingsLoading) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!apartment) {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Квартира не найдена</h2>
          <Button onClick={() => navigate(createPageUrl("Apartments"))}>
            Вернуться к каталогу
          </Button>
        </div>
      </div>
    );
  }

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const isProfileIncomplete = !user?.phone || !user?.profile_completed;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl("Apartments"))}
          className="mb-6 hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к квартирам
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={apartment.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"}
                alt={apartment.title}
                className="w-full h-full object-cover"
              />
            </div>

            <Tabs defaultValue="info" className="w-full">
              <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg border-0 mb-4">
                <TabsTrigger value="info" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  Информация
                </TabsTrigger>
                <TabsTrigger value="chat" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Чат с владельцем
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                      {apartment.title}
                    </h1>

                    {apartment.address && (
                      <div className="flex items-center gap-2 text-slate-600 mb-6">
                        <MapPin className="w-5 h-5 text-indigo-600" />
                        <span className="text-lg">{apartment.address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-6 mb-6 pb-6 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <Bed className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold">{apartment.bedrooms} спален</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold">{apartment.bathrooms || 1} ванных</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-600" />
                        <span className="font-semibold">до {apartment.max_guests || 2} гостей</span>
                      </div>
                    </div>

                    {apartment.description && (
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-3">Описание</h2>
                        <p className="text-slate-600 leading-relaxed">{apartment.description}</p>
                      </div>
                    )}

                    {apartment.amenities && apartment.amenities.length > 0 && (
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Удобства</h2>
                        <div className="grid grid-cols-2 gap-3">
                          {apartment.amenities.map((amenity, index) => {
                            const Icon = amenityIcons[amenity] || CheckCircle2;
                            return (
                              <div key={index} className="flex items-center gap-2 text-slate-600">
                                <Icon className="w-5 h-5 text-indigo-600" />
                                <span>{amenity}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {reviews.length > 0 && (
                  <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <h2 className="text-2xl font-bold text-slate-900">Отзывы</h2>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-500" />
                          <span className="text-xl font-bold text-slate-900">{averageRating}</span>
                          <span className="text-slate-600">({reviews.length} отзывов)</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <ReviewCard key={review.id} review={review} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat">
                {user && owner && (
                  <ChatWindow
                    apartmentId={apartmentId}
                    recipientEmail={owner.email}
                    recipientName={owner.full_name}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6 pb-6 border-b border-slate-200">
                  <div className="text-3xl font-bold text-slate-900">
                    {apartment.price_per_night?.toLocaleString('ru-RU')} ₽
                  </div>
                  <div className="text-slate-600">за ночь</div>
                </div>

                {isProfileIncomplete && (
                  <Alert className="mb-6 bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800 text-sm">
                      Заполните профиль для быстрого бронирования
                      <Button 
                        variant="link" 
                        className="text-amber-800 underline p-0 h-auto ml-1"
                        onClick={() => navigate(createPageUrl("Profile"))}
                      >
                        Перейти в профиль
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {checkIn && checkOut && !datesAvailable && (
                  <Alert className="mb-6 bg-red-50 border-red-200">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800 text-sm">
                      Выбранные даты уже забронированы. Выберите другой период.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <Label className="font-semibold mb-2 block">Даты</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkIn ? format(checkIn, "d MMM", { locale: ru }) : "Заезд"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkIn}
                            onSelect={setCheckIn}
                            disabled={(date) => date < new Date()}
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start text-left font-normal">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {checkOut ? format(checkOut, "d MMM", { locale: ru }) : "Выезд"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={checkOut}
                            onSelect={setCheckOut}
                            disabled={(date) => date <= (checkIn || new Date())}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="guests" className="font-semibold mb-2 block">Количество гостей</Label>
                    <Input
                      id="guests"
                      type="number"
                      min="1"
                      max={apartment.max_guests || 10}
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="requests" className="font-semibold mb-2 block">Особые пожелания</Label>
                    <Textarea
                      id="requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={3}
                      placeholder="Расскажите о ваших пожеланиях..."
                    />
                  </div>

                  {checkIn && checkOut && nights > 0 && (
                    <div className="bg-indigo-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">
                          {apartment.price_per_night?.toLocaleString('ru-RU')} ₽ × {nights} ночей
                        </span>
                        <span className="font-semibold">
                          {(apartment.price_per_night * nights).toLocaleString('ru-RU')} ₽
                        </span>
                      </div>
                      <div className="flex justify-between text-lg font-bold pt-2 border-t border-indigo-200">
                        <span>Итого</span>
                        <span>{calculateTotalPrice().toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  )}

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-6 text-lg shadow-lg shadow-indigo-500/30"
                    disabled={!checkIn || !checkOut || !datesAvailable || createBookingMutation.isPending || isProfileIncomplete}
                  >
                    {createBookingMutation.isPending ? "Бронируем..." : "Забронировать"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}