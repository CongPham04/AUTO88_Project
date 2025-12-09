import { useNavigate, useLocation } from "react-router-dom";
import { adminMenu } from "./menuConfig";
// ✅ Import hình ảnh logo
import logo from '@/assets/images/auto88-removebg.png';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    // ✅ Thay đổi: bg-gray-900, text-white, border-gray-800
    <aside className="w-64 border-r border-gray-800 bg-gray-900 p-6 hidden md:block text-white">
      {/* Logo */}
      <div
        className="flex items-center space-x-3 cursor-pointer hover:opacity-90 transition-opacity mb-8"
        onClick={() => navigate("/admin")}
      >
        <img 
          src={logo} 
          alt="Auto88 Logo" 
          className="h-12 w-12 object-contain rounded-lg p-5" // Thêm nền trắng nhỏ cho logo nếu là file png trong suốt
        />
        <div>
          {/* ✅ Text màu trắng */}
          <h1 className="text-2xl font-bold text-white">AUTO 88</h1>
          <p className="text-xs text-gray-400">Uy tín - Chất lượng - Giá tốt</p>
        </div>
      </div>

      {/* Menu items */}
      <nav className="space-y-2">
        {adminMenu.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                active
                  ? "bg-gray-800 text-white font-semibold shadow-md border-l-4 border-blue-500" // Style cho trạng thái Active
                  : "text-gray-400 hover:bg-gray-800 hover:text-white" // Style mặc định & Hover
              }`}
            >
              <Icon className={`w-6 h-6 mr-2 ${active ? "text-blue-400" : "text-gray-500 group-hover:text-white"}`} />
              <div className="text-left text-sm tracking-wide">{item.label}</div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}