import { User, Menu, LogOut, Bell, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useUserStore } from '@/store/userStore';
import { adminMenu } from './menuConfig';

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 w-full h-24">
      <div className="px-4 sm:px-6 lg:px-8 w-full h-full">
        <div className="flex justify-between items-center h-full gap-x-4">
          {/* Logo + text */}
          <div
            onClick={() => navigate('/admin')}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Quản trị hệ thống Auto 88
            </h1>
            <p className="hidden lg:block text-sm sm:text-base md:text-lg text-gray-600">
              Chào mừng bạn đến với trang quản trị hệ thống!
            </p>
          </div>

          {/* User actions */}
          <div className="flex justify-between items-center h-full gap-x-4 pr-8"> {/* 👈 thêm padding phải để dịch vào trong */}
            <button
              // onClick={() => navigate('/admin/messages')}
              className="relative hover:text-red-600 transition-colors mr-2 cursor-pointer"
            >
              <MessageSquare className="w-6 h-6 text-gray-700" />
              <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                5
              </span>
            </button>

            <button
              //   onClick={() => navigate('/admin/notifications')}
              className="relative hover:text-red-600 transition-colors ml-2 cursor-pointer "
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {/* Badge thông báo nhỏ */}
              <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                3
              </span>
            </button>
            {isAuthenticated && user ? (
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="hover:bg-gray-100 cursor-pointer transition-colors flex items-center"
                >
                  {user.avatar ? (
                    //Nếu có avatar → hiển thị ảnh
                    <img
                      src={user.avatar}
                      alt={user.fullName || user.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    // Nếu không có avatar → hiển thị icon mặc định
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-red-600" />
                    </div>
                  )}

                  <span className="ml-1 text-base sm:text-lg font-medium truncate max-w-[120px] sm:max-w-[180px]">
                    {user.fullName || user.username}
                  </span>
                </Button>

                {isUserMenuOpen && (
                  <div
                    className="absolute left-4 top-[95%] w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                  >
                    <div className="py-2">
                      {/* <button
                        onClick={() => {
                          navigate('/admin/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <User className="w-5 h-5 inline mr-2" />
                          <span>Tài khoản của tôi</span>
                        </div>
                      </button> */}

                      <button
                        onClick={() => {
                          logout();
                          window.location.href = '/';
                          setIsUserMenuOpen(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <LogOut className="w-5 h-5 inline mr-2" />
                          <span>Đăng xuất</span>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={() => navigate('/auth')}
                size="sm"
                variant="default"
                className="hover:bg-gray-100 transition-colors"
              >
                <User className="w-4 h-4 mr-2" />
                Đăng nhập
              </Button>
            )}

            {/* Mobile menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <div className="mt-8 h-full max-h-[calc(100vh-4rem)] overflow-y-auto px-4 space-y-2">
                  {adminMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsSheetOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 rounded hover:bg-gray-100 text-gray-700 transition-colors"
                      >
                        <Icon className="w-6 h-6 mr-3" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
