import { Outlet } from "react-router-dom";
import Header from "@/components/layout-parts/user/Header";
import Footer from "@/components/layout-parts/user/Footer";
import HomePage from "@/pages/home/HomePage";
import { useLocation } from "react-router-dom";

export default function MainLayout() {
  const location = useLocation();
  const isAuth = location.pathname.startsWith('/auth');  // Chỉ render HomePage làm background cho auth routes

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1 container mx-auto w-full p-4 relative">
        {isAuth && <HomePage />}  
        {/* // Chỉ render khi là auth route, tránh duplicate trên home */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );}