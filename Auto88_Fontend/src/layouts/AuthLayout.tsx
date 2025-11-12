import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button'; 

export default function AuthLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    // [SỬA ĐỔI] Logic chống "xô lệch" (layout shift)
    
    // 1. Lấy ra style gốc của body (để khôi phục khi đóng modal)
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPaddingRight = document.body.style.paddingRight;

    // 2. Tính toán độ rộng của thanh cuộn
    // (Chiều rộng cửa sổ TRỪ đi chiều rộng của vùng nội dung)
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    // 3. Áp dụng style mới
    document.body.style.overflow = 'hidden';
    // Thêm đệm phải bằng đúng độ rộng của thanh cuộn
    document.body.style.paddingRight = `${scrollbarWidth}px`; 

    // 4. Cleanup: Trả lại style gốc khi component unmount (khi modal đóng)
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.body.style.paddingRight = originalBodyPaddingRight;
    };
  }, []); // Chỉ chạy 1 lần khi modal mở

  const handleClose = () => {
    navigate(-1); // Quay về trang trước
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md p-5 bg-white rounded-lg shadow-xl relative"
        onClick={(e) => e.stopPropagation()} 
      >
        <Button
          type="button"
          onClick={handleClose}
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 rounded-full bg-white shadow-md hover:bg-gray-100"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-gray-600" />
        </Button>
        <Outlet />
      </div>
    </div>
  );
}