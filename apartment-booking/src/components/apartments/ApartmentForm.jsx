import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, MapPin, DollarSign, Upload, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

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

// Функция для сжатия изображения перед загрузкой
const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Пропорционально уменьшаем размер, если изображение слишком большое
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Конвертируем в base64 с заданным качеством
        canvas.toBlob(
          (blob) => {
            const compressedReader = new FileReader();
            compressedReader.readAsDataURL(blob);
            compressedReader.onloadend = () => {
              resolve(compressedReader.result);
            };
            compressedReader.onerror = reject;
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function ApartmentForm({ onSuccess, onCancel }) {
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    city: "",
    address: "",
    price_per_night: "",
    bedrooms: "",
    bathrooms: "",
    max_guests: "",
    image_url: "",
    amenities: [],
    is_available: true
  });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }

    // Проверяем размер файла (максимум 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Размер файла не должен превышать 10MB');
      return;
    }

    setIsUploading(true);
    try {
      console.log('Начало сжатия изображения...');
      console.log('Исходный размер:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Сжимаем изображение перед отправкой
      const compressedImage = await compressImage(file, 1200, 0.8);
      
      console.log('Сжатое изображение:', (compressedImage.length / 1024 / 1024).toFixed(2), 'MB');
      
      setFormData(prev => ({ ...prev, image_url: compressedImage }));
    } catch (error) {
      console.error("Ошибка при обработке изображения:", error);
      alert('Ошибка при обработке изображения. Попробуйте другой файл.');
    }
    setIsUploading(false);
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      price_per_night: parseFloat(formData.price_per_night),
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      max_guests: parseInt(formData.max_guests)
    };

    console.log('Отправка данных квартиры...');
    console.log('Размер данных:', JSON.stringify(dataToSubmit).length, 'байт');

    onSuccess(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Основная информация</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="font-semibold">Название квартиры *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Уютная студия в центре"
              className="mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="font-semibold">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о вашей квартире..."
              rows={4}
              className="mt-2"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city" className="font-semibold">Город *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Москва"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="address" className="font-semibold">Адрес</Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="улица Пушкина, 10"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Характеристики и цена</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price_per_night" className="font-semibold">Цена за ночь (₽) *</Label>
              <Input
                id="price_per_night"
                type="number"
                min="0"
                step="100"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                placeholder="5000"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="bedrooms" className="font-semibold">Количество спален *</Label>
              <Input
                id="bedrooms"
                type="number"
                min="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="2"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="bathrooms" className="font-semibold">Количество ванных</Label>
              <Input
                id="bathrooms"
                type="number"
                min="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="1"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="max_guests" className="font-semibold">Максимум гостей</Label>
              <Input
                id="max_guests"
                type="number"
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                placeholder="4"
                className="mt-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Фотография</CardTitle>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Изображение будет автоматически сжато для оптимизации
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="image-upload"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center gap-3"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-sm text-slate-600">Обработка изображения...</p>
                  </>
                ) : formData.image_url ? (
                  <>
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <Button type="button" variant="outline" size="sm">
                      Изменить фото
                    </Button>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 text-slate-400" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-900">
                        Загрузите фотографию квартиры
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG до 10MB (будет автоматически сжато)
                      </p>
                    </div>
                  </>
                )}
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Удобства</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {AMENITIES_OPTIONS.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox
                  id={amenity}
                  checked={formData.amenities.includes(amenity)}
                  onCheckedChange={() => handleAmenityToggle(amenity)}
                />
                <Label htmlFor={amenity} className="cursor-pointer text-sm">
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <Checkbox
              id="is_available"
              checked={formData.is_available}
              onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
            />
            <Label htmlFor="is_available" className="cursor-pointer font-semibold">
              Квартира доступна для бронирования
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="px-8">
            Отмена
          </Button>
        )}
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-indigo-500/30"
          disabled={isUploading}
        >
          <CheckCircle2 className="w-5 h-5 mr-2" />
          {isUploading ? 'Обработка...' : 'Добавить квартиру'}
        </Button>
      </div>
    </form>
  );
}