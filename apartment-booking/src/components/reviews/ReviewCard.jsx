import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

export default function ReviewCard({ review }) {
  const { data: reviewer } = useQuery({
    queryKey: ['user', review.created_by],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ email: review.created_by });
      return users[0];
    },
    enabled: !!review.created_by,
  });

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-slate-900">
                  {reviewer?.full_name || "Гость"}
                </p>
                <p className="text-sm text-slate-500">
                  {format(new Date(review.created_date), "d MMMM yyyy", { locale: ru })}
                </p>
              </div>
              {renderStars(review.rating)}
            </div>
          </div>
        </div>

        <p className="text-slate-700 mb-4">{review.comment}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500 mb-1">Чистота</p>
            {renderStars(review.cleanliness)}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Общение</p>
            {renderStars(review.communication)}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Расположение</p>
            {renderStars(review.location)}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Цена/качество</p>
            {renderStars(review.value)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}