import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle2 } from "lucide-react";

export default function TelegramChannel() {
  return (
    <div className="min-h-screen p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-2xl w-full bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
            <Send className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Наш Telegram канал
          </h1>
          
          <p className="text-lg text-slate-600 mb-8">
            Подпишитесь на наш канал, чтобы получать актуальные новости, специальные предложения и эксклюзивные скидки на аренду квартир
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Эксклюзивные предложения</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Первыми узнавайте о новых квартирах</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span>Специальные акции и скидки</span>
            </div>
          </div>

          <a 
            href="https://t.me/sfdhdfhd_bot" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-blue-500/30">
              <Send className="w-5 h-5 mr-2" />
              Перейти в Telegram
            </Button>
          </a>

          <p className="text-sm text-slate-500 mt-6">
            @sfdhdfhd_bot
          </p>
        </CardContent>
      </Card>
    </div>
  );
}