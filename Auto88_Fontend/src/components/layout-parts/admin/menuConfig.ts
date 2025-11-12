import { LayoutDashboard, Car, Package, Users, Newspaper, Tag, CreditCard } from "lucide-react";

export interface AdminMenuItem {
  path: string;
  label: string;
  icon: React.ElementType; // dùng component thay vì JSX.Element để tái sử dụng
}

export const adminMenu: AdminMenuItem[] = [
  {
    path: "/admin/overview",
    label: "Trang Tổng Quan",
    icon: LayoutDashboard,
  },
  {
    path: "/admin/cars",
    label: "Quản Lý Xe",
    icon: Car,
  },
  {
    path: "/admin/orders",
    label: "Quản Lý Đơn Hàng",
    icon: Package,
  },
  {
    path: "/admin/users",
    label: "Quản Lý Người Dùng",
    icon: Users,
  },
  {
    path: "/admin/promotions",
    label: "Quản Lý Khuyến Mãi",
    icon: Tag,
  },
  {
    path: "/admin/news",
    label: "Quản Lý Tin Tức",
    icon: Newspaper,
  },
];
