import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Shield, 
  Home, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  UsersIcon,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Moderation() {
  const [activeTab, setActiveTab] = useState("apartments");
  const [selectedApartment, setSelectedApartment] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: apartments, isLoading: apartmentsLoading } = useQuery({
    queryKey: ['apartments'],
    queryFn: () => base44.entities.Apartment.list('-created_date'),
    initialData: [],
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date'),
    initialData: [],
  });

  const updateApartmentMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Apartment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
      // If an apartment was updated through the dialog, clear selected state
      setSelectedApartment(null);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ email, data }) => {
      const user = users.find(u => u.email === email);
      return base44.entities.User.update(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const pendingApartments = apartments.filter(apt => apt.moderation_status === "pending");
  const approvedApartments = apartments.filter(apt => apt.moderation_status === "approved");
  const rejectedApartments = apartments.filter(apt => apt.moderation_status === "rejected");

  const handleApartmentAction = (apartment, status) => {
    updateApartmentMutation.mutate({
      id: apartment.id,
      data: { moderation_status: status }
    });
  };

  const handleUserAction = (user, blocked) => {
    updateUserMutation.mutate({
      email: user.email,
      data: { is_blocked: blocked }
    });
  };

  const handleApartmentClick = (apartment) => {
    setSelectedApartment(apartment);
    setDetailsDialogOpen(true);
  };

  const handleApartmentActionFromDialog = (apartment, status) => {
    updateApartmentMutation.mutate({
      id: apartment.id,
      data: { moderation_status: status }
    });
    setDetailsDialogOpen(false);
  };

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
        <Alert className="max-w-md bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            У вас нет доступа к этой странице. Требуются права администратора.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLoading = apartmentsLoading || usersLoading;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Модерация
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Управление объявлениями и пользователями
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="apartments" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white relative">
              <Home className="w-4 h-4 mr-2" />
              Квартиры
              {pendingApartments.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {pendingApartments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Пользователи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="apartments">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-8">
                {pendingApartments.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-6 h-6 text-amber-600" />
                      На модерации ({pendingApartments.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <AnimatePresence>
                        {pendingApartments.map((apt) => (
                          <motion.div
                            key={apt.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => handleApartmentClick(apt)}>
                              <div className="relative h-48 overflow-hidden rounded-t-xl">
                                <img
                                  src={apt.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                                  alt={apt.title}
                                  className="w-full h-full object-cover"
                                />
                                <Badge className="absolute top-3 right-3 bg-amber-500 text-white border-0">
                                  На модерации
                                </Badge>
                                <div className="absolute bottom-3 right-3">
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 hover:bg-white"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApartmentClick(apt);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-1" />
                                    Подробнее
                                  </Button>
                                </div>
                              </div>
                              <CardContent className="p-4">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">
                                  {apt.title}
                                </h3>
                                <div className="space-y-2 mb-4">
                                  {apt.city && (
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                      <MapPin className="w-4 h-4" />
                                      {apt.city}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <DollarSign className="w-4 h-4" />
                                    {apt.price_per_night?.toLocaleString('ru-RU')} ₽/ночь
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Владелец: {apt.created_by}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApartmentAction(apt, "approved");
                                    }}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    size="sm"
                                    disabled={updateApartmentMutation.isPending}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Одобрить
                                  </Button>
                                  <Button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApartmentAction(apt, "rejected");
                                    }}
                                    variant="outline"
                                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                                    size="sm"
                                    disabled={updateApartmentMutation.isPending}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Отклонить
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    Одобренные ({approvedApartments.length})
                  </h2>
                  {approvedApartments.length === 0 ? (
                    <p className="text-slate-600">Нет одобренных квартир</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {approvedApartments.slice(0, 6).map((apt) => (
                        <Card key={apt.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-md">
                          <div className="relative h-32 overflow-hidden rounded-t-xl">
                            <img
                              src={apt.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"}
                              alt={apt.title}
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-2 right-2 bg-green-500 text-white border-0 text-xs">
                              Одобрено
                            </Badge>
                          </div>
                          <CardContent className="p-3">
                            <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                              {apt.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-1">{apt.city}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users">
            {isLoading ? (
              <div className="space-y-4">
                {Array(5).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <Card key={user.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{user.full_name}</p>
                            <p className="text-sm text-slate-600">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-slate-500">{user.phone}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-slate-100 text-slate-800'}>
                            {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                          </Badge>
                          {user.is_blocked ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-red-100 text-red-800">
                                Заблокирован
                              </Badge>
                              <Button
                                onClick={() => handleUserAction(user, false)}
                                variant="outline"
                                size="sm"
                                className="border-green-200 text-green-600 hover:bg-green-50"
                                disabled={updateUserMutation.isPending}
                              >
                                Разблокировать
                              </Button>
                            </div>
                          ) : user.email !== currentUser.email && (
                            <Button
                              onClick={() => handleUserAction(user, true)}
                              variant="outline"
                              size="sm"
                              className="border-red-200 text-red-600 hover:bg-red-50"
                              disabled={updateUserMutation.isPending}
                            >
                              Заблокировать
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Детали объявления</DialogTitle>
            </DialogHeader>
            {selectedApartment && (
              <div className="space-y-6">
                <div className="relative h-96 rounded-xl overflow-hidden">
                  <img
                    src={selectedApartment.image_url || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200"}
                    alt={selectedApartment.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{selectedApartment.title}</h2>
                  {selectedApartment.address && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                      <span>{selectedApartment.city}, {selectedApartment.address}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-500">Спален</p>
                      <p className="font-semibold">{selectedApartment.bedrooms}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-500">Ванных</p>
                      <p className="font-semibold">{selectedApartment.bathrooms || 1}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <UsersIcon className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-500">Гостей</p>
                      <p className="font-semibold">до {selectedApartment.max_guests || 2}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-600" />
                    <div>
                      <p className="text-xs text-slate-500">Цена</p>
                      <p className="font-semibold">{selectedApartment.price_per_night?.toLocaleString('ru-RU')} ₽</p>
                    </div>
                  </div>
                </div>

                {selectedApartment.description && (
                  <div>
                    <h3 className="font-bold text-lg mb-2">Описание</h3>
                    <p className="text-slate-600">{selectedApartment.description}</p>
                  </div>
                )}

                {selectedApartment.amenities && selectedApartment.amenities.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">Удобства</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApartment.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary" className="bg-indigo-50 text-indigo-700">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-bold text-sm text-slate-700 mb-2">Информация о владельце</h3>
                  <p className="text-sm text-slate-600">Email: {selectedApartment.created_by}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Создано: {new Date(selectedApartment.created_date).toLocaleString('ru-RU')}
                  </p>
                </div>

                {selectedApartment.moderation_status === "pending" && (
                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleApartmentActionFromDialog(selectedApartment, "approved")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      disabled={updateApartmentMutation.isPending}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Одобрить объявление
                    </Button>
                    <Button
                      onClick={() => handleApartmentActionFromDialog(selectedApartment, "rejected")}
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      disabled={updateApartmentMutation.isPending}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Отклонить объявление
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
