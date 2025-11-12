/// <reference types="vite/client" />

// Khai báo cấu trúc của import.meta.env
interface ImportMetaEnv {
  // Thêm biến VITE_API_BASE_URL vào đây
  readonly VITE_API_BASE_URL: string 
  // ... thêm các biến VITE_... khác nếu có
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}