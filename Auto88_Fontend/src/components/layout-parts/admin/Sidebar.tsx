import { useNavigate, useLocation } from "react-router-dom";
import { adminMenu } from "./menuConfig";
import { Car } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 border-r bg-white p-4 hidden md:block">
      {/* Logo */}
      <div
        className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity mb-8"
        onClick={() => navigate("/admin")}
      >
        <div className="bg-red-600 p-2 rounded-lg">
          <Car className="w-8 h-8 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AUTO 88</h1>
          <p className="text-xs text-gray-500">Uy tín - Chất lượng - Giá tốt</p>
        </div>
      </div>

      {/* Menu items */}
      <nav className="space-y-4">
        {adminMenu.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center px-3 py-2 rounded transition-colors cursor-pointer ${
                isActive(item.path)
                  ? "bg-gray-100 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-6 h-6 mr-4" />
              <div className="ml-2 text-left">{item.label}</div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
