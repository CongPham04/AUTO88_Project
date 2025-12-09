import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button'; 

export default function AuthLayout() {
  const navigate = useNavigate();
  const location = useLocation(); // Bổ sung hook để kiểm tra state

  useEffect(() => {
    // Logic chống "xô lệch" (layout shift) - Giữ nguyên code cũ của bạn
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`; 

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
    };
  }, []);

  const handleClose = () => {
    // [LOGIC MỚI] Xử lý nút đóng thông minh hơn
    // 1. Nếu có backgroundLocation (tức là mở từ trang khác): Quay lại trang trước (-1)
    // 2. Nếu không có (tức là F5 hoặc gõ URL trực tiếp): Quay về trang chủ ('/')
    if (location.state?.backgroundLocation) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div 
      // [GIỮ NGUYÊN CSS CŨ] bg-black/50 và backdrop-blur-sm để đảm bảo độ mờ nền đúng ý bạn
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        // [GIỮ NGUYÊN CSS CŨ] max-w-md để chiều rộng form không bị quá to
        className="w-full max-w-md p-5 bg-white rounded-lg shadow-xl relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <Button
          type="button"
          onClick={handleClose}
          variant="ghost"
          size="icon"
          // [GIỮ NGUYÊN CSS CŨ] Vị trí nút đóng
          className="absolute right-3 top-3 rounded-full bg-white shadow-md hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
        
        {/* Nơi render AuthPage */}
        <Outlet />
      </div>
    </div>
  );
}