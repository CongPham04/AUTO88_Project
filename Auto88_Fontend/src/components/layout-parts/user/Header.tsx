import { Car, Search, GitCompare, User, Menu, Phone, Mail, LogOut, Home, Newspaper, CarTaxiFrontIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserStore } from '@/store/useUserStore';
import { useCompareStore } from '@/store/compareStore';
import ReactCountryFlag from "react-country-flag";
import { Skeleton } from '@/components/ui/skeleton';
// ✅ Import hình ảnh logo
import logo from '@/assets/images/auto88.png';

// ✅ Import các component cho AlertDialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useUserStore();
  const compareList = useCompareStore((s) => s.compareList);
  const compareCount = compareList.length;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // ✅ State điều khiển hộp thoại đăng xuất
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Giả lập loading state
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAuthLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
    setIsUserMenuOpen(false);
    setIsLogoutDialogOpen(false); // Đóng dialog sau khi đăng xuất
  };

  const menuItems = [
    { label: 'Trang chủ', path: '/', icon: <Home className="w-4 h-4" /> },
    { label: 'Xe ô tô', path: '/cars', icon: <CarTaxiFrontIcon className="w-4 h-4" /> },
    { label: 'Tin tức', path: '/news', icon: <Newspaper className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>Hotline: 1900-1234</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>info@auto88.com</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span><ReactCountryFlag className='text-2xl' countryCode="VN" svg /> Showroom: 123 Văn Tiến Dũng, Phường Tây Tựu, TP.HN </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <img 
              src={logo} 
              alt="Auto88 Logo" 
              className="h-12 w-12 object-contain rounded-lg" 
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AUTO 88</h1>
              <p className="text-xs text-gray-500">Uy tín - Chất lượng - Giá tốt</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Button
                key={item.path}
                variant="ghost"
                onClick={() => navigate(item.path)}
                className={`text-base font-medium px-4 ${location.pathname === item.path ? 'text-red-600 bg-gray-50' : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'}`}
              >
                <span className="mr-1.5">{item.icon}</span>
                {item.label}
              </Button>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            {/* Compare Button */}
            <Button variant="ghost" size="sm" onClick={() => navigate('/comparison')} className="relative cursor-pointer hover:bg-gray-100 transition-colors px-2 sm:px-4">
              <GitCompare className="w-5 h-5" />
              {compareCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {compareCount}
                </Badge>
              )}
              <span className="hidden lg:inline ml-2">So sánh</span>
            </Button>

            {/* User Menu Area */}
            {isAuthLoading ? (
              // Skeleton Loading
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ) : isAuthenticated && user ? (
              // Logged In User
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-2 px-2 h-10"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || user.email}
                      className="w-8 h-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                  )}

                  <span className="ml-1 text-base sm:text-lg font-medium truncate max-w-[120px] sm:max-w-[180px]">
                    {user.fullName || user.email}
                  </span>
                </Button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-2 border-b bg-gray-50 md:hidden">
                      <p className="text-xs font-semibold text-gray-500">Đăng nhập bởi</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.fullName || user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/profile');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 mt-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2" />
                        <span>Tài khoản của tôi</span>
                      </div>
                    </button>

                    <button
                      // ✅ Mở dialog thay vì logout ngay
                      onClick={() => setIsLogoutDialogOpen(true)}
                      className="w-full text-left px-4 py-3 mt-4 mb-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors flex items-center gap-2"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Đăng xuất</span>
                      </div>

                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Login Button
              <Button
                onClick={() => navigate('/auth', { state: { backgroundLocation: location } })}
                size="sm"
                variant="default"
                className="bg-black hover:bg-gray-800 text-white shadow-none"
              >
                <User className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {menuItems.map((item) => (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-100 font-medium'}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* ✅ Hộp thoại xác nhận đăng xuất */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Đăng xuất
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </header>
  );
}