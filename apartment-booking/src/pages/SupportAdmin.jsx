import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Send,
  MessageSquare,
  CheckCircle2,
  Clock,
  AlertCircle,
  User
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

export default function SupportAdmin() {
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [responseText, setResponseText] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("open");

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: () => base44.entities.SupportTicket.list('-created_date'),
    initialData: [],
  });

  const respondToTicketMutation = useMutation({
    mutationFn: ({ id, response }) => 
      base44.entities.SupportTicket.update(id, {
        admin_response: response,
        status: "closed",
        responded_by: currentUser?.email,
        responded_at: new Date().toISOString()
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
      setDialogOpen(false);
      setSelectedTicket(null);
      setResponseText("");
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => 
      base44.entities.SupportTicket.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });

  const handleOpenTicket = (ticket) => {
    setSelectedTicket(ticket);
    setResponseText(ticket.admin_response || "");
    setDialogOpen(true);
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;

    await respondToTicketMutation.mutateAsync({
      id: selectedTicket.id,
      response: responseText
    });
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

  const openTickets = tickets.filter(t => t.status === "open");
  const inProgressTickets = tickets.filter(t => t.status === "in_progress");
  const closedTickets = tickets.filter(t => t.status === "closed");

  const renderTicketsList = (ticketsList) => {
    if (ticketsList.length === 0) {
      return (
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">Обращений нет</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <AnimatePresence>
          {ticketsList.map((ticket, index) => {
            const StatusIcon = statusIcons[ticket.status];
            return (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer" onClick={() => handleOpenTicket(ticket)}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <StatusIcon className="w-5 h-5 text-indigo-600" />
                          <CardTitle className="text-xl">{ticket.subject}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <User className="w-4 h-4" />
                          <span>{ticket.created_by}</span>
                          <span>•</span>
                          <span>{format(new Date(ticket.created_date), "d MMM yyyy, HH:mm", { locale: ru })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <Badge className={`${statusColors[ticket.status]} border-0`}>
                          {statusLabels[ticket.status]}
                        </Badge>
                        {ticket.status === "open" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatusMutation.mutate({ id: ticket.id, status: "in_progress" });
                            }}
                            className="text-xs"
                          >
                            Взять в работу
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 line-clamp-2">{ticket.message}</p>
                    {ticket.admin_response && (
                      <div className="mt-3 p-3 bg-indigo-50 rounded-lg">
                        <p className="text-xs text-indigo-600 font-semibold mb-1">Ваш ответ:</p>
                        <p className="text-sm text-indigo-800 line-clamp-1">{ticket.admin_response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <HelpCircle className="w-10 h-10 text-indigo-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              Служба поддержки
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Управление обращениями пользователей
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <TabsTrigger value="open" className="data-[state=active]:bg-amber-600 data-[state=active]:text-white relative">
              <Clock className="w-4 h-4 mr-2" />
              Новые
              {openTickets.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {openTickets.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              В работе ({inProgressTickets.length})
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Закрытые ({closedTickets.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              renderTicketsList(openTickets)
            )}
          </TabsContent>

          <TabsContent value="in_progress">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              renderTicketsList(inProgressTickets)
            )}
          </TabsContent>

          <TabsContent value="closed">
            {isLoading ? (
              <div className="space-y-4">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-40 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              renderTicketsList(closedTickets)
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Обращение в поддержку</DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h3>
                    <Badge className={`${statusColors[selectedTicket.status]} border-0`}>
                      {statusLabels[selectedTicket.status]}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                    <User className="w-4 h-4" />
                    <span>{selectedTicket.created_by}</span>
                    <span>•</span>
                    <span>{format(new Date(selectedTicket.created_date), "d MMMM yyyy, HH:mm", { locale: ru })}</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Сообщение пользователя:</p>
                  <p className="text-slate-900 whitespace-pre-wrap">{selectedTicket.message}</p>
                </div>

                {selectedTicket.status !== "closed" ? (
                  <form onSubmit={handleSubmitResponse} className="space-y-4">
                    <div>
                      <Label htmlFor="response" className="font-semibold">
                        Ваш ответ
                      </Label>
                      <Textarea
                        id="response"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Введите ответ пользователю..."
                        rows={6}
                        required
                        className="mt-2"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                        className="flex-1"
                      >
                        Отмена
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
                        disabled={respondToTicketMutation.isPending}
                      >
                        {respondToTicketMutation.isPending ? "Отправка..." : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Отправить и закрыть
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <p className="text-sm font-semibold text-indigo-900 mb-2">Ваш ответ:</p>
                    <p className="text-indigo-800 whitespace-pre-wrap">{selectedTicket.admin_response}</p>
                    {selectedTicket.responded_at && (
                      <p className="text-xs text-indigo-600 mt-3">
                        Ответил: {selectedTicket.responded_by} • {format(new Date(selectedTicket.responded_at), "d MMMM yyyy, HH:mm", { locale: ru })}
                      </p>
                    )}
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