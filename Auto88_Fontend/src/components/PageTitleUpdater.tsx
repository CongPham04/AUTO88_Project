import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    let title = 'Auto88 - Hệ thống bán xe uy tín'; // Tiêu đề mặc định

    // 1. Cấu hình cho các trang Public
    if (path === '/') title = 'Trang chủ | Auto88';
    else if (path === '/cars') title = 'Danh sách xe | Auto88';
    else if (path === '/news') title = 'Tin tức | Auto88';
    else if (path === '/comparison') title = 'So sánh xe | Auto88';
    else if (path === '/order/checkout') title = 'Thanh toán | Auto88';
    else if (path === '/profile') title = 'Tài khoản của tôi | Auto88';
    
    // 2. Cấu hình cho trang Auth
    else if (path === '/auth/login') title = 'Đăng nhập | Auto88';
    else if (path === '/auth/register') title = 'Đăng ký | Auto88';
    else if (path === '/auth/forgot-password') title = 'Quên mật khẩu | Auto88';

    // 3. Cấu hình cho Admin
    else if (path.startsWith('/admin')) {
      if (path === '/admin' || path === '/admin/overview') title = 'Tổng quan hệ thống | Admin';
      else if (path.startsWith('/admin/cars')) title = 'Quản lý xe | Admin';
      else if (path.startsWith('/admin/orders')) title = 'Quản lý đơn hàng | Admin';
      else if (path.startsWith('/admin/users')) title = 'Quản lý người dùng | Admin';
      else if (path.startsWith('/admin/news')) title = 'Quản lý tin tức | Admin';
      else if (path.startsWith('/admin/profile')) title = 'Tải khoản của tôi | Admin';
      else title = 'Trang quản trị | Admin';
    }

    // 4. Xử lý các trang chi tiết (Dynamic Route)
    // Lưu ý: Đây chỉ là tiêu đề tạm, các trang chi tiết nên tự update lại tên cụ thể
    else if (path.match(/^\/cars\/\d+$/)) title = 'Chi tiết xe | Auto88';
    else if (path.match(/^\/news\/\d+$/)) title = 'Chi tiết tin tức | Auto88';

    // Cập nhật tiêu đề
    document.title = title;
  }, [location]);

  return null; // Component này không render gì ra giao diện cả
};

export default PageTitleUpdater;