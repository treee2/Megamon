import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Lock, User, AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  // Состояния для формы входа
  const [formData, setFormData] = useState({
    login: "",
    password: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Отправляем запрос на сервер для проверки учетных данных
      const user = await base44.auth.login(formData.login, formData.password);
      
      // Если вход успешен, сохраняем email пользователя в контексте
      login(user.email);
      
      // Перенаправляем на главную страницу
      navigate(createPageUrl("Apartments"));
    } catch (err) {
      // Отображаем ошибку пользователю
      setError(err.message || "Ошибка при входе в систему");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <div className="w-full max-w-md">
        {/* Логотип и название приложения */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Megamon</h1>
          <p className="text-slate-600">Премиум квартиры для вашего отдыха</p>
        </div>

        {/* Карточка с формой входа */}
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold text-center">Вход в систему</CardTitle>
            <CardDescription className="text-center">
              Введите свои учетные данные для доступа к системе
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Поле для логина */}
              <div className="space-y-2">
                <Label htmlFor="login" className="font-semibold">Логин</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="login"
                    type="text"
                    value={formData.login}
                    onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                    placeholder="Введите логин"
                    className="pl-10 h-12"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Поле для пароля */}
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Пароль</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Введите пароль"
                    className="pl-10 h-12"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Отображение ошибки, если она есть */}
              {error && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 text-sm">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Кнопка входа */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold h-12 text-base shadow-lg shadow-indigo-500/30"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Вход...
                  </>
                ) : (
                  "Войти в систему"
                )}
              </Button>
            </form>

            {/* Подсказка с тестовыми аккаунтами */}
            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-semibold text-slate-700 mb-2">Тестовые аккаунты:</p>
              <div className="space-y-2 text-xs text-slate-600">
                <div>
                  <span className="font-medium">Администратор:</span> admin / password123
                </div>
                <div>
                  <span className="font-medium">Пользователь 1:</span> ivan.petrov / password123
                </div>
                <div>
                  <span className="font-medium">Пользователь 2:</span> maria.ivanova / password123
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}