
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { User, Phone, MapPin, CreditCard, CheckCircle2 } from "lucide-react";

export default function ProfileForm({ user, onSave, isSaving }) {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "", // Added full_name
    phone: user?.phone || "",
    date_of_birth: user?.date_of_birth || "",
    passport_series: user?.passport_series || "",
    passport_number: user?.passport_number || "",
    passport_issued_by: user?.passport_issued_by || "",
    passport_issue_date: user?.passport_issue_date || "",
    address: user?.address || "",
    preferences: {
      smoking: user?.preferences?.smoking || false,
      pets: user?.preferences?.pets || false,
      early_checkin: user?.preferences?.early_checkin || false,
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, profile_completed: true });
  };

  const handlePreferenceChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Личная информация</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Full Name field */}
          <div>
            <Label htmlFor="full_name" className="font-semibold">Полное имя *</Label>
            <div className="relative mt-2">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Иван Иванов"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone" className="font-semibold">Телефон *</Label>
              <div className="relative mt-2">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+7 (999) 123-45-67"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date_of_birth" className="font-semibold">Дата рождения</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="mt-2"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="address" className="font-semibold">Адрес проживания</Label>
            <div className="relative mt-2">
              <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Город, улица, дом, квартира"
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-600" />
            <CardTitle className="text-xl">Паспортные данные</CardTitle>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Необходимы для оформления бронирования
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="passport_series" className="font-semibold">Серия паспорта</Label>
              <Input
                id="passport_series"
                value={formData.passport_series}
                onChange={(e) => setFormData({ ...formData, passport_series: e.target.value })}
                placeholder="1234"
                maxLength={4}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="passport_number" className="font-semibold">Номер паспорта</Label>
              <Input
                id="passport_number"
                value={formData.passport_number}
                onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                placeholder="567890"
                maxLength={6}
                className="mt-2"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="passport_issued_by" className="font-semibold">Кем выдан</Label>
            <Input
              id="passport_issued_by"
              value={formData.passport_issued_by}
              onChange={(e) => setFormData({ ...formData, passport_issued_by: e.target.value })}
              placeholder="Отделением УФМС России"
              className="mt-2"
            />
          </div>
          
          <div>
            <Label htmlFor="passport_issue_date" className="font-semibold">Дата выдачи</Label>
            <Input
              id="passport_issue_date"
              type="date"
              value={formData.passport_issue_date}
              onChange={(e) => setFormData({ ...formData, passport_issue_date: e.target.value })}
              className="mt-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Предпочтения</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="smoking"
              checked={formData.preferences.smoking}
              onCheckedChange={(checked) => handlePreferenceChange('smoking', checked)}
            />
            <Label htmlFor="smoking" className="cursor-pointer">
              Курящий
            </Label>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Checkbox
              id="pets"
              checked={formData.preferences.pets}
              onCheckedChange={(checked) => handlePreferenceChange('pets', checked)}
            />
            <Label htmlFor="pets" className="cursor-pointer">
              С домашними животными
            </Label>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Checkbox
              id="early_checkin"
              checked={formData.preferences.early_checkin}
              onCheckedChange={(checked) => handlePreferenceChange('early_checkin', checked)}
            />
            <Label htmlFor="early_checkin" className="cursor-pointer">
              Предпочитаю ранний заезд
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          type="submit"
          className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-indigo-500/30"
          disabled={isSaving}
        >
          {isSaving ? (
            "Сохранение..."
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Сохранить профиль
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
