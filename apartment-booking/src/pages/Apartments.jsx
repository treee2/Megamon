import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

import ApartmentCard from "../components/apartments/ApartmentCard";
import ApartmentFilters from "../components/apartments/ApartmentFilters";

export default function Apartments() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "all",
    checkIn: null,
    checkOut: null,
    guests: null,
    minPrice: 0,
    maxPrice: 30000,
    bedrooms: "all",
    amenities: []
  });

  const { data: apartments, isLoading } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list('-created_date'),
    initialData: [],
  });

  const cities = [...new Set(apartments.map(apt => apt.city).filter(Boolean))];

  const filteredApartments = apartments.filter(apt => {
    const isApproved = apt.moderation_status === "approved";
    
    const matchesSearch = apt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         apt.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCity = filters.city === "all" || apt.city === filters.city;
    
    const matchesPrice = apt.price_per_night >= (filters.minPrice || 0) && 
                        apt.price_per_night <= (filters.maxPrice || Infinity);
    
    const matchesBedrooms = filters.bedrooms === "all" || 
                           (filters.bedrooms === "4" ? apt.bedrooms >= 4 : apt.bedrooms === parseInt(filters.bedrooms));
    
    const matchesGuests = !filters.guests || (apt.max_guests || 2) >= filters.guests;
    
    // Парсим amenities если это JSON-строка
    const aptAmenities = typeof apt.amenities === 'string' 
      ? JSON.parse(apt.amenities || '[]')
      : apt.amenities || [];
    
    const matchesAmenities = filters.amenities.length === 0 || 
                            filters.amenities.every(amenity => aptAmenities.includes(amenity));
    
    return isApproved && matchesSearch && matchesCity && matchesPrice && matchesBedrooms && matchesGuests && matchesAmenities;
  });

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-3">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Премиум квартиры
            </h1>
            <Button
              onClick={() => navigate(createPageUrl("AddApartment"))}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/30"
            >
              <Plus className="w-5 h-5 mr-2" />
              Добавить квартиру
            </Button>
          </div>
          <p className="text-slate-600 text-lg">
            Найдите идеальное жильё для вашего отдыха
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Поиск по названию, описанию или адресу..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-white/90 backdrop-blur-sm border-0 shadow-lg text-base"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-4">
              <ApartmentFilters filters={filters} onFilterChange={setFilters} cities={cities} />
            </div>
          </div>

          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-64 w-full rounded-xl" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : filteredApartments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Квартиры не найдены
                </h3>
                <p className="text-slate-600">
                  Попробуйте изменить параметры поиска
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4 text-sm text-slate-600">
                  Найдено квартир: {filteredApartments.length}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence>
                    {filteredApartments.map((apartment, index) => (
                      <motion.div
                        key={apartment.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <ApartmentCard apartment={apartment} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
