
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, DollarSign, User, CheckCircle2, XCircle, Clock, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const statusColors = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
  completed: "bg-slate-100 text-slate-800 border-slate-200"
};

const statusLabels = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждено",
  cancelled: "Отменено",
  completed: "Завершено"
};

export default function BookingCard({ booking, apartment, showActions = false }) {
  const queryClient = useQueryClient();
  const [showReviewForm, setShowReviewForm] = React.useState(false);
  const navigate = useNavigate();

  const { data: guestUser } = useQuery({
    queryKey: ['user', booking.created_by],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: booking.created_by });
      return users[0];
    },
    enabled: !!booking.created_by,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: existingReview } = useQuery({
    queryKey: ['review', booking.id],
    queryFn: async () => {
      const reviews = await base44.entities.Review.filter({ booking_id: booking.id });
      return reviews[0];
    },
    enabled: !!booking.id,
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Booking.update(id, { status }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const handleConfirm = () => {
    updateBookingMutation.mutate({ id: booking.id, status: "confirmed" });
  };

  const handleCancel = () => {
    updateBookingMutation.mutate({ id: booking.id, status: "cancelled" });
  };

  const isOwner = currentUser?.role === 'admin' || apartment?.created_by === currentUser?.email;
  const canLeaveReview = booking.status === "completed" && 
                         !existingReview && 
                         booking.created_by === currentUser?.email;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl font-bold text-slate-900">
            {apartment?.title || "Загрузка..."}
          </CardTitle>
          <Badge className={`${statusColors[booking.status]} border font-semibold`}>
            {statusLabels[booking.status]}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {apartment?.address && (
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <span className="text-sm">{apartment.city && `${apartment.city}, `}{apartment.address}</span>
          </div>
        )}

        {guestUser && showActions && (
          <div className="flex items-center gap-2 text-slate-600 bg-slate-50 p-3 rounded-lg">
            <User className="w-4 h-4 text-indigo-600" />
            <div className="text-sm">
              <span className="font-medium">{guestUser.full_name}</span>
              {guestUser.phone && (
                <span className="text-slate-500 ml-2">• {guestUser.phone}</span>
              )}
              <div className="text-xs text-slate-500 mt-1">{guestUser.email}</div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Заезд</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(booking.check_in), "d MMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Выезд</p>
              <p className="text-sm font-semibold text-slate-900">
                {format(new Date(booking.check_out), "d MMM yyyy", { locale: ru })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 text-indigo-600" />
            <span className="text-sm font-medium">{booking.guests} гостей</span>
          </div>
          
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <span className="text-lg font-bold text-slate-900">
              {booking.total_price?.toLocaleString('ru-RU')} ₽
            </span>
          </div>
        </div>

        {booking.special_requests && (
          <div className="pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500 font-medium mb-1">Особые пожелания:</p>
            <p className="text-sm text-slate-700">{booking.special_requests}</p>
          </div>
        )}

        {booking.status === "confirmed" && booking.created_by === currentUser?.email && (
          <div className="pt-4 border-t border-slate-100">
            <Button
              onClick={() => navigate(createPageUrl(`Payment?bookingId=${booking.id}`))}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Перейти к оплате
            </Button>
          </div>
        )}

        {canLeaveReview && !showReviewForm && (
          <div className="pt-4 border-t border-slate-100">
            <Button
              onClick={() => setShowReviewForm(true)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Оставить отзыв
            </Button>
          </div>
        )}

        {existingReview && (
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Отзыв оставлен</span>
            </div>
          </div>
        )}

        {showActions && isOwner && booking.status === "pending" && (
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              disabled={updateBookingMutation.isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Подтвердить
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
              disabled={updateBookingMutation.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Отменить
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
