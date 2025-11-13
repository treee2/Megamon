import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, User } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default function ChatWindow({ apartmentId, bookingId, recipientEmail, recipientName }) {
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', apartmentId, bookingId],
    queryFn: async () => {
      let allMessages = await base44.entities.Message.list('-created_date');
      
      // Фильтруем сообщения для данной квартиры/бронирования
      allMessages = allMessages.filter(msg => {
        if (bookingId && msg.booking_id === bookingId) return true;
        if (apartmentId && msg.apartment_id === apartmentId) {
          // Показываем сообщения где текущий пользователь либо отправитель, либо получатель
          return msg.created_by === currentUser?.email || msg.recipient_email === currentUser?.email;
        }
        return false;
      });
      
      return allMessages.reverse();
    },
    enabled: !!currentUser,
    refetchInterval: 5000, // Обновляем каждые 5 секунд
  });

  const sendMessageMutation = useMutation({
    mutationFn: (messageData) => base44.entities.Message.create(messageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setMessageText("");
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Message.update(id, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  useEffect(() => {
    // Прокручиваем вниз при новых сообщениях
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }

    // Помечаем непрочитанные сообщения как прочитанные
    if (messages && currentUser) {
      messages.forEach(msg => {
        if (!msg.is_read && msg.recipient_email === currentUser.email) {
          markAsReadMutation.mutate({ id: msg.id });
        }
      });
    }
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    sendMessageMutation.mutate({
      text: messageText,
      recipient_email: recipientEmail,
      apartment_id: apartmentId,
      booking_id: bookingId,
    });
  };

  if (!currentUser) return null;

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg h-[600px] flex flex-col">
      <CardHeader className="border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl">Чат</CardTitle>
            <p className="text-sm text-slate-600">{recipientName || recipientEmail}</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="text-center text-slate-500 py-8">Загрузка...</div>
          ) : messages && messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p>Нет сообщений</p>
              <p className="text-sm">Начните общение первым!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages?.map((message) => {
                const isOwn = message.created_by === currentUser.email;
                return (
                  <div key={message.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={isOwn ? 'bg-indigo-100' : 'bg-slate-100'}>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[70%]`}>
                      <div className={`rounded-2xl px-4 py-2 ${
                        isOwn 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white' 
                          : 'bg-slate-100 text-slate-900'
                      }`}>
                        <p className="text-sm break-words">{message.text}</p>
                      </div>
                      <span className="text-xs text-slate-500 mt-1 px-2">
                        {format(new Date(message.created_date), "HH:mm, d MMM", { locale: ru })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Введите сообщение..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800"
              disabled={sendMessageMutation.isPending || !messageText.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}