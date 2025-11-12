// src/main.tsx (Thay thế TOÀN BỘ nội dung file)

import React from "react";
import { createRoot } from "react-dom/client";
// [THÊM MỚI] Import BrowserRouter
import { BrowserRouter } from "react-router-dom"; 
import App from "./App";
import "./index.css";

// [XÓA BỎ] import { RouterProvider } from "react-router-dom";
// [XÓA BỎ] import { router } from "@/routes/AppRoutes"; (hoặc tên file router.tsx của bạn)

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* [THAY ĐỔI] Bọc App bằng BrowserRouter */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
    {/* [XÓA BỎ] <RouterProvider router={router} /> */}
  </React.StrictMode>
);