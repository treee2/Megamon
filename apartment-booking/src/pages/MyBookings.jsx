
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar, Package, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import BookingCard from "../components/bookings/BookingCard";
import ReviewForm from "../components/reviews/ReviewForm";

export default function MyBookings() {
  const [activeTab, setActiveTab] = useState("my");
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ['bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date'),
    initialData: [],
  });

  const { data: apartments, isLoading: apartmentsLoading } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list(),
    initialData: [],
  });

  const createReviewMutation = useMutation({
    mutationFn: (reviewData) => base44.entities.Review.create(reviewData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review'] }); // Invalidate single review queries if they exist
      setReviewDialogOpen(false);
      setSelectedBooking(null);
    },
  });

  const myBookings = bookings.filter(booking => booking.created_by === currentUser?.email);
  
  const pendingBookings = bookings.filter(booking => 
    booking.status === "pending" && 
    apartments.find(apt => apt.id === booking.apartment_id && apt.created_by === currentUser?.email)
  );

  const getApartmentById = (id) => {
    return apartments.find(apt => apt.id === id);
  };

  const handleOpenReviewDialog = (booking) => {
    setSelectedBooking(booking);
    setReviewDialogOpen(true);
  };

  const handleSubmitReview = async (reviewData) => {
    await createReviewMutation.mutateAsync(reviewData);
  };

  const isLoading = bookingsLoading || apartmentsLoading;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Бронирования
          </h1>
          <p className="text-slate-600 text-lg">
            Управляйте своими поездками и запросами
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="my" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Мои бронирования
            </TabsTrigger>
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white relative">
              <Bell className="w-4 h-4 mr-2" />
              Запросы на подтверждение
              {pendingBookings.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  У вас пока нет бронирований
                </h3>
                <p className="text-slate-600">
                  Начните путешествовать!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {myBookings.map((booking, index) => {
                    const apartment = getApartmentById(booking.apartment_id);
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <BookingCard 
                          booking={booking} 
                          apartment={apartment}
                          showActions={false}
                          onReviewClick={() => handleOpenReviewDialog(booking)}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : pendingBookings.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Нет запросов на подтверждение
                </h3>
                <p className="text-slate-600">
                  Здесь будут отображаться новые бронирования ваших квартир
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {pendingBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <BookingCard 
                        booking={booking} 
                        apartment={getApartmentById(booking.apartment_id)}
                        showActions={true}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Оставить отзыв</DialogTitle>
            </DialogHeader>
            {selectedBooking && (
              <ReviewForm
                booking={selectedBooking}
                apartment={getApartmentById(selectedBooking.apartment_id)}
                onSubmit={handleSubmitReview}
                onCancel={() => setReviewDialogOpen(false)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}