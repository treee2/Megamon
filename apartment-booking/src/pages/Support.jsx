import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  HelpCircle,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const statusColors = {
  open: "bg-amber-100 text-amber-800",
  in_progress: "bg-blue-100 text-blue-800",
  closed: "bg-green-100 text-green-800"
};

const statusLabels = {
  open: "Открыто",
  in_progress: "В работе",
  closed: "Закрыто"
};

const statusIcons = {
  open: Clock,
  in_progress: MessageSquare,
  closed: CheckCircle2
};

export default function Support() {
  const queryClient = useQueryClient();
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    message: ""
  });

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const allTickets = await base44.entities.SupportTicket.list('-created_date');
      // Показываем только свои тикеты
      return allTickets.filter(ticket => ticket.created_by === currentUser?.email);
    },
    enabled: !!currentUser,
    initialData: [],
  });

  const createTicketMutation = useMutation({
    mutationFn: (ticketData) => base44.entities.SupportTicket.create(ticketData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setFormData({ subject: "", message: "" });
      setShowNewTicketForm(false);
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createTicketMutation.mutateAsync(formData);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Поддержка
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Задайте вопрос или сообщите о проблеме
          </p>
        </div>

        {!showNewTicketForm ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-8">
            <CardContent className="p-6">
              <div className="text-center py-6">
                <HelpCircle className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Нужна помощь?
                </h3>
                <p className="text-slate-600 mb-6">
                  Создайте обращение, и наша команда поддержки ответит в ближайшее время
                </p>
                <Button
                  onClick={() => setShowNewTicketForm(true)}
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-lg shadow-indigo-500/30"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Создать обращение
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg mb-8">
              <CardHeader>
                <CardTitle>Новое обращение</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="subject" className="font-semibold">
                      Тема обращения *
                    </Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Кратко опишите проблему"
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message" className="font-semibold">
                      Сообщение *
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Подробно опишите вашу проблему или вопрос..."
                      rows={6}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewTicketForm(false)}
                      className="flex-1"
                    >
                      Отмена
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                      disabled={createTicketMutation.isPending}
                    >
                      {createTicketMutation.isPending ? "Отправка..." : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Отправить
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-slate-900">Мои обращения</h2>

          {isLoading ? (
            <div className="space-y-4">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-xl" />
              ))}
            </div>
          ) : tickets.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">У вас пока нет обращений в поддержку</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {tickets.map((ticket, index) => {
                const StatusIcon = statusIcons[ticket.status];
                return (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <StatusIcon className="w-5 h-5 text-indigo-600" />
                              <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                            </div>
                            <p className="text-sm text-slate-500">
                              Создано {format(new Date(ticket.created_date), "d MMMM yyyy, HH:mm", { locale: ru })}
                            </p>
                          </div>
                          <Badge className={`${statusColors[ticket.status]} border-0`}>
                            {statusLabels[ticket.status]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-700 mb-1">Ваше сообщение:</p>
                          <p className="text-slate-600 whitespace-pre-wrap">{ticket.message}</p>
                        </div>

                        {ticket.admin_response && (
                          <Alert className="bg-indigo-50 border-indigo-200">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                            <AlertDescription>
                              <p className="text-sm font-semibold text-indigo-900 mb-2">
                                Ответ службы поддержки:
                              </p>
                              <p className="text-indigo-800 whitespace-pre-wrap">
                                {ticket.admin_response}
                              </p>
                              {ticket.responded_at && (
                                <p className="text-xs text-indigo-600 mt-2">
                                  {format(new Date(ticket.responded_at), "d MMMM yyyy, HH:mm", { locale: ru })}
                                </p>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}