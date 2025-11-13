import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Users, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function ApartmentCard({ apartment }) {
  return (
    <Link to={createPageUrl(`ApartmentDetails?id=${apartment.id}`)}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 bg-white/90 backdrop-blur-sm">
          <div className="relative h-64 overflow-hidden">
            <img
              src={apartment.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
              alt={apartment.title}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            />
            <div className="absolute top-4 right-4">
              <Badge className="bg-white/95 text-indigo-700 border-0 shadow-lg font-semibold px-3 py-1">
                {apartment.price_per_night?.toLocaleString('ru-RU')} ₽ / ночь
              </Badge>
            </div>
            {!apartment.is_available && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center">
                <Badge className="bg-red-500 text-white border-0 shadow-xl px-4 py-2 text-sm">
                  Забронировано
                </Badge>
              </div>
            )}
          </div>
          
          <CardContent className="p-6">
            <h3 className="font-bold text-xl text-slate-900 mb-2 line-clamp-1">
              {apartment.title}
            </h3>
            
            {apartment.address && (
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <MapPin className="w-4 h-4" />
                <span className="text-sm line-clamp-1">{apartment.address}</span>
              </div>
            )}
            
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{apartment.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">{apartment.bathrooms || 1}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span className="font-medium">до {apartment.max_guests || 2}</span>
              </div>
            </div>
            
            {apartment.description && (
              <p className="text-sm text-slate-600 mt-4 line-clamp-2">
                {apartment.description}
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}