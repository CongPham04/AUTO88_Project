import { User, Menu, LogOut, Bell, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useUserStore } from '@/store/useUserStore';
import { adminMenu } from './menuConfig';

// ✅ 1. Import các component cho AlertDialog
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

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useUserStore();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // ✅ 2. State điều khiển hộp thoại đăng xuất
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // ✅ 3. Hàm xử lý đăng xuất
  const handleLogout = () => {
    logout();
    window.location.href = '/'; // Chuyển về trang chủ
    setIsUserMenuOpen(false);
    setIsLogoutDialogOpen(false);
  };

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
          <div className="flex justify-between items-center h-full gap-x-4 pr-8">
            <button className="relative hover:text-red-600 transition-colors mr-2 cursor-pointer">
              <MessageSquare className="w-6 h-6 text-gray-700" />
              <span className="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                5
              </span>
            </button>

            <button className="relative hover:text-red-600 transition-colors ml-1 cursor-pointer ">
              <Bell className="w-6 h-6 text-gray-700" />
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
                  size="sm"
                  className="hover:bg-gray-100 cursor-pointer transition-colors flex items-center gap-2 px-2 h-10"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName || user.email}
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                  )}

                  <span className="ml-1 text-base sm:text-lg font-medium truncate max-w-[120px] sm:max-w-[180px]">
                    {user.fullName || user.email}
                  </span>
                </Button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 top-full w-full bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-200"
                  >
                    <div className="px-4 py-2 border-b bg-gray-50 md:hidden">
                      <p className="text-xs font-semibold text-gray-500">Đăng nhập bởi</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user.fullName || user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigate('/admin/profile');
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
                      // ✅ 4. Sửa nút đăng xuất: Mở dialog thay vì logout ngay
                      onClick={() => {
                        setIsUserMenuOpen(false); // Đóng menu dropdown trước
                        setIsLogoutDialogOpen(true); // Mở dialog xác nhận
                      }}
                      className="w-full text-left px-4 py-3 mt-4 mb-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer transition-colors flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                    </button>
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

      {/* ✅ 5. Hộp thoại xác nhận đăng xuất */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị không?
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