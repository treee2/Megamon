import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { SlidersHorizontal, MapPin, CalendarIcon, Users, DollarSign, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const AMENITIES_OPTIONS = [
  "Wi-Fi",
  "ТВ",
  "Кондиционер",
  "Парковка",
  "Кухня",
  "Стиральная машина",
  "Балкон",
  "Лифт"
];

export default function ApartmentFilters({ filters, onFilterChange, cities }) {
  const handleAmenityToggle = (amenity) => {
    const currentAmenities = filters.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    onFilterChange({ ...filters, amenities: newAmenities });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-lg text-slate-900">Фильтры</h3>
        </div>
        
        <div className="space-y-6">
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              Город
            </Label>
            <Select
              value={filters.city || "all"}
              onValueChange={(value) => onFilterChange({ ...filters, city: value })}
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Все города" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все города</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-indigo-600" />
              Даты
            </Label>
            <div className="space-y-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.checkIn ? format(new Date(filters.checkIn), "d MMM yyyy", { locale: ru }) : "Заезд"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.checkIn ? new Date(filters.checkIn) : undefined}
                    onSelect={(date) => onFilterChange({ ...filters, checkIn: date })}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.checkOut ? format(new Date(filters.checkOut), "d MMM yyyy", { locale: ru }) : "Выезд"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filters.checkOut ? new Date(filters.checkOut) : undefined}
                    onSelect={(date) => onFilterChange({ ...filters, checkOut: date })}
                    disabled={(date) => date <= (filters.checkIn || new Date())}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div>
            <Label htmlFor="guests-filter" className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              Количество гостей
            </Label>
            <Input
              id="guests-filter"
              type="number"
              min="1"
              value={filters.guests || ""}
              onChange={(e) => onFilterChange({ ...filters, guests: e.target.value ? parseInt(e.target.value) : null })}
              placeholder="Любое количество"
              className="bg-white border-slate-200"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-600" />
              Цена за ночь: {filters.minPrice?.toLocaleString('ru-RU')} - {filters.maxPrice?.toLocaleString('ru-RU')} ₽
            </Label>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-slate-500">Минимум</Label>
                <Slider
                  value={[filters.minPrice || 0]}
                  onValueChange={([value]) => onFilterChange({ ...filters, minPrice: value })}
                  max={30000}
                  min={0}
                  step={500}
                  className="mt-2"
                />
              </div>
              <div>
                <Label className="text-xs text-slate-500">Максимум</Label>
                <Slider
                  value={[filters.maxPrice || 30000]}
                  onValueChange={([value]) => onFilterChange({ ...filters, maxPrice: value })}
                  max={30000}
                  min={0}
                  step={500}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 block">
              Количество спален
            </Label>
            <Select
              value={filters.bedrooms || "all"}
              onValueChange={(value) => onFilterChange({ ...filters, bedrooms: value })}
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Любое" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Любое количество</SelectItem>
                <SelectItem value="1">1 спальня</SelectItem>
                <SelectItem value="2">2 спальни</SelectItem>
                <SelectItem value="3">3 спальни</SelectItem>
                <SelectItem value="4">4+ спальни</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Удобства
            </Label>
            <div className="space-y-3">
              {AMENITIES_OPTIONS.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <Checkbox
                    id={`filter-${amenity}`}
                    checked={(filters.amenities || []).includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <Label htmlFor={`filter-${amenity}`} className="cursor-pointer text-sm font-normal">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => onFilterChange({
              city: "all",
              checkIn: null,
              checkOut: null,
              guests: null,
              minPrice: 0,
              maxPrice: 30000,
              bedrooms: "all",
              amenities: []
            })}
          >
            Сбросить фильтры
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}