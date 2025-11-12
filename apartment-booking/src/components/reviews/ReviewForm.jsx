import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Send } from "lucide-react";

export default function ReviewForm({ booking, apartment, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    rating: 5,
    comment: "",
    cleanliness: 5,
    communication: 5,
    location: 5,
    value: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      apartment_id: apartment.id,
      booking_id: booking.id
    });
  };

  const renderStarRating = (field, label) => {
    return (
      <div>
        <Label className="text-sm font-semibold mb-2 block">{label}</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setFormData({ ...formData, [field]: star })}
              className="transition-all duration-200 hover:scale-110"
            >
              <Star
                className={`w-8 h-8 ${
                  star <= formData[field]
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Оставить отзыв</CardTitle>
        <p className="text-sm text-slate-600">{apartment.title}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStarRating("rating", "Общая оценка")}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderStarRating("cleanliness", "Чистота")}
            {renderStarRating("communication", "Общение")}
            {renderStarRating("location", "Расположение")}
            {renderStarRating("value", "Цена/качество")}
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm font-semibold mb-2 block">
              Ваш отзыв *
            </Label>
            <Textarea
              id="comment"
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              placeholder="Расскажите о вашем опыте..."
              rows={5}
              required
              className="resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
            >
              <Send className="w-4 h-4 mr-2" />
              Отправить отзыв
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}