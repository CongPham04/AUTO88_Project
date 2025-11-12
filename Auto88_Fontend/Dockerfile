# ------------------------------------
# Stage 1: Build Application (React/Vite)
# ------------------------------------
FROM node:20-alpine AS build

# Đặt thư mục làm việc trong container
WORKDIR /app

# Sao chép tệp cấu hình dependencies
COPY package.json package-lock.json ./

# Cài đặt dependencies
RUN npm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Thực hiện build. Output mặc định của Vite là /app/dist
# Giả định bạn sử dụng lệnh tiêu chuẩn: npm run build
# Nếu lệnh của bạn khác, hãy thay thế bằng lệnh đúng
RUN npm run build

# ------------------------------------
# Stage 2: Serve với Nginx
# ------------------------------------
FROM nginx:stable-alpine AS final

# Sao chép cấu hình Nginx tùy chỉnh để hỗ trợ React Router (SPA)
# Tạo file nginx.conf này ở bước tiếp theo
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sao chép các tệp đã build từ stage 'build' vào thư mục phục vụ của Nginx
# Thay thế /app/dist nếu thư mục output của bạn khác
COPY --from=build /app/build /usr/share/nginx/html

# Mở cổng 80 (Nginx mặc định)
EXPOSE 80

# Command mặc định để khởi động Nginx
CMD ["nginx", "-g", "daemon off;"]