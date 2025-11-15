import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Home, Calendar, User, Building2, Plus, LogOut, Settings, ChevronLeft, HelpCircle, Send } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  {
    title: "Квартиры",
    url: createPageUrl("Apartments"),
    icon: Home,
  },
  {
    title: "Добавить квартиру",
    url: createPageUrl("AddApartment"),
    icon: Plus,
  },
  {
    title: "Мои бронирования",
    url: createPageUrl("MyBookings"),
    icon: Calendar,
  },
  {
    title: "Профиль",
    url: createPageUrl("Profile"),
    icon: User,
  },
  {
    title: "Поддержка",
    url: createPageUrl("Support"),
    icon: HelpCircle,
  },
    {
    title: "Telegram",
    url: "/telegram",
    icon: Send,
  },
];

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toggleSidebar, open } = useSidebar();
  const { logout } = useAuth();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    },
  });

  // Получаем количество pending бронирований для текущего пользователя
  const { data: pendingBookings } = useQuery({
    queryKey: ['pendingBookings', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const bookings = await base44.entities.Booking.list();
      // Для владельца - показываем бронирования его квартир со статусом pending
      if (user.role === 'admin') {
        const apartments = await base44.entities.Apartment.filter({ created_by: user.email });
        const apartmentIds = apartments.map(apt => apt.id);
        return bookings.filter(b => 
          apartmentIds.includes(b.apartment_id) && 
          b.status === 'pending'
        );
      }
      return [];
    },
    enabled: !!user?.email,
    refetchInterval: 30000, // Обновляем каждые 30 секунд
  });

  const pendingCount = pendingBookings?.length || 0;

  const handleLogout = () => {
    logout();
    base44.auth.logout();
    navigate(createPageUrl("Login"), { replace: true });
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <style>{`
        :root {
          --primary: 231 48% 48%;
          --primary-foreground: 0 0% 100%;
          --accent: 43 74% 66%;
        }
      `}</style>

      <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <SidebarHeader className="border-b border-slate-200/60 p-6">
          <div className="flex items-center justify-between">
            <Link to={createPageUrl("Apartments")} className="flex items-center gap-3 group flex-1">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all duration-300">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              {open && (
                <div>
                  <h2 className="font-bold text-slate-900 text-lg">Megamon</h2>
                  <p className="text-xs text-slate-500 font-medium">Бронируйте с удовольствием🏠</p>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex hover:bg-indigo-50 transition-colors"
            >
              <ChevronLeft className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${!open ? 'rotate-180' : ''}`} />
            </Button>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="p-3">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      className={`hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-200 rounded-xl mb-1 ${
                        location.pathname === item.url ? 'bg-indigo-50 text-indigo-700 shadow-sm' : ''
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-4 py-3 relative">
                        <item.icon className="w-5 h-5" />
                        {open && <span className="font-medium">{item.title}</span>}
                        {item.title === "Мои бронирования" && pendingCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {pendingCount}
                          </span>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                 {isAdmin && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-purple-50 hover:text-purple-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === createPageUrl("Moderation") ? 'bg-purple-50 text-purple-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={createPageUrl("Moderation")} className="flex items-center gap-3 px-4 py-3">
                          <Settings className="w-5 h-5" />
                          {open && <span className="font-medium">Модерация</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-amber-50 hover:text-amber-700 transition-all duration-200 rounded-xl mb-1 ${
                          location.pathname === createPageUrl("SupportAdmin") ? 'bg-amber-50 text-amber-700 shadow-sm' : ''
                        }`}
                      >
                        <Link to={createPageUrl("SupportAdmin")} className="flex items-center gap-3 px-4 py-3">
                          <HelpCircle className="w-5 h-5" />
                          {open && <span className="font-medium">Управление поддержкой</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-slate-200/60 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full hover:bg-slate-50 p-2 rounded-lg transition-colors duration-200">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                  <User className="w-5 h-5 text-white" />
                </div>
                {open && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {user?.full_name || 'Гость'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {user?.email || 'Добро пожаловать'}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link to={createPageUrl("Profile")} className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Настройки профиля
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1 flex flex-col">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
            <h1 className="text-xl font-bold text-slate-900">Megamon</h1>
          </div>
        </header>

        <div className="flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </SidebarProvider>
  );
}
