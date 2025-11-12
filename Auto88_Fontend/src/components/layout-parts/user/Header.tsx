// src/layouts/Header.tsx (Code đầy đủ đã sửa)

import { Car, Search, GitCompare, User, Menu, Phone, Mail, LogOut, Minus } from 'lucide-react';
// [SỬA ĐỔI] Import thêm useLocation
import { useNavigate, useLocation } from 'react-router-dom'; 
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useUserStore } from '@/store/userStore';
import { useCompareStore } from '@/store/compareStore';
import ReactCountryFlag from "react-country-flag";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation(); // [SỬA ĐỔI] Lấy vị trí hiện tại
  const { user, isAuthenticated, logout } = useUserStore();
  const compareList = useCompareStore((s) => s.compareList);
  const compareCount = compareList.length;
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuItems = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Xe ô tô', path: '/cars' },
    { label: 'Tin tức', path: '/news' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      {/* (Phần top bar) */}
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
          {/* (Phần logo) */}
          <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
            <div className="bg-red-600 p-2 rounded-lg">
              <Car className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AUTO 88</h1>
              <p className="text-xs text-gray-500">Uy tín - Chất lượng - Giá tốt</p>
            </div>
          </div>
          
          {/* (Phần nav) */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button key={item.path} onClick={() => navigate(item.path)} className="text-gray-700 hover:text-red-600 font-medium transition-colors cursor-pointer">
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* (Phần so sánh) */}
            <Button variant="ghost" size="sm" onClick={() => navigate('/comparison')} className="relative cursor-pointer hover:bg-gray-100 transition-colors">
              <GitCompare className="w-5 h-5" />
              {compareCount > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {compareCount}
                </Badge>
              )}
              <span className="hidden lg:inline ml-2">So sánh</span>
            </Button>

            {isAuthenticated && user ? (
              // (Phần menu người dùng đã đăng nhập)
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-gray-100 cursor-pointer transition-colors flex items-center"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.fullName || user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <span className="text-base font-medium truncate max-w-[150px]">
                    {user.fullName || user.username}
                  </span>
                </Button>
                
                {/* [CODE ĐẦY ĐỦ] Đây là phần dropdown menu bị thiếu */}
                {isUserMenuOpen && (
                  <div className="absolute left-2 top-full mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                    <div className="py-3">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full h-12 text-left px-6 py-1 text-base text-gray-700 hover:bg-red-50 hover:text-blue-900 cursor-pointer whitespace-nowrap transition-colors duration-200 font-medium"
                      >
                        <div className='flex items-center'>
                          <User className="w-5 h-5 inline mr-2" />
                          <span>Tài khoản của tôi</span>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          window.location.href = '/';
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full h-8 text-left px-6 py-1 mb-6 text-base text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer whitespace-nowrap transition-colors duration-200 font-medium"
                      >
                        <div className='flex items-center mt-1'>
                          <LogOut className="w-5 h-5 inline mr-2" />
                          <span>Đăng xuất</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // [SỬA ĐỔI] Thêm state: { backgroundLocation: location }
              <Button 
                onClick={() => navigate('/auth', { state: { backgroundLocation: location } })} 
                size="sm" 
                variant="default"
              >
                <User className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            )}

            {/* (Phần mobile menu) */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden cursor-pointer hover:bg-gray-100 transition-colors">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="space-y-4 mt-8">
                  {menuItems.map((item) => (
                    <button key={item.path} onClick={() => navigate(item.path)} className="block w-full text-left px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors cursor-pointer">
                      {item.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}