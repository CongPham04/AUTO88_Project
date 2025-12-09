package com.carshop.oto_shop.services;

import com.carshop.oto_shop.dto.dashboard.*;
import com.carshop.oto_shop.entities.Car;
import com.carshop.oto_shop.entities.Order;
import com.carshop.oto_shop.entities.OrderDetail;
import com.carshop.oto_shop.enums.OrderStatus;
import com.carshop.oto_shop.enums.Role;
import com.carshop.oto_shop.repositories.AccountRepository;
import com.carshop.oto_shop.repositories.CarRepository;
import com.carshop.oto_shop.repositories.OrderRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class AdminDashboardService {

    private final OrderRepository orderRepository;
    private final AccountRepository accountRepository;
    private final CarRepository carRepository;

    public AdminDashboardService(OrderRepository orderRepository,
                                 AccountRepository accountRepository,
                                 CarRepository carRepository) {
        this.orderRepository = orderRepository;
        this.accountRepository = accountRepository;
        this.carRepository = carRepository;
    }

    /**
     * Lấy toàn bộ dữ liệu tổng quan cho Dashboard
     */
    @Transactional(readOnly = true)
    public DashboardResponse getDashboardOverview() {
        DashboardResponse response = new DashboardResponse();

        // 1. Tính toán các chỉ số thống kê (4 Cards trên cùng)
        response.setStats(calculateStats());

        // 2. Dữ liệu biểu đồ doanh thu 6 tháng (Bar Chart)
        response.setRevenueChart(getRevenueChartData());

        // 3. Dữ liệu tỷ lệ trạng thái đơn hàng (Pie Chart)
        response.setOrderStatusChart(getOrderStatusChartData());

        // 4. Danh sách đơn hàng mới nhất (Top 5)
        response.setRecentOrders(getRecentOrders());

        // 5. Danh sách xe sắp hết hàng (Low Stock)
        response.setLowStockCars(getLowStockCars());

        return response;
    }

    // ================= PRIVATE HELPERS =================

    private DashboardStats calculateStats() {
        DashboardStats stats = new DashboardStats();
        LocalDateTime now = LocalDateTime.now();

        // Xác định khoảng thời gian: Tháng này vs Tháng trước
        LocalDateTime startOfThisMonth = YearMonth.now().atDay(1).atStartOfDay();
        LocalDateTime endOfThisMonth = now; // Tính đến thời điểm hiện tại

        LocalDateTime startOfLastMonth = YearMonth.now().minusMonths(1).atDay(1).atStartOfDay();
        LocalDateTime endOfLastMonth = YearMonth.now().minusMonths(1).atEndOfMonth().atTime(23, 59, 59);

        // --- Card 1: Tổng xe trong kho ---
        // (Chỉ số này thường biến động tức thời, không so sánh theo tháng)
        long totalCars = carRepository.sumTotalQuantity();
        stats.setTotalCars(new StatMetric(totalCars, 0));

        // --- Card 2: Đơn hàng tháng này ---
        long ordersThisMonth = orderRepository.countByOrderDateBetween(startOfThisMonth, endOfThisMonth);
        long ordersLastMonth = orderRepository.countByOrderDateBetween(startOfLastMonth, endOfLastMonth);
        stats.setMonthlyOrders(new StatMetric(ordersThisMonth, calculateGrowth(ordersThisMonth, ordersLastMonth)));

        // --- Card 3: Khách hàng mới (Role USER) ---
        long usersThisMonth = accountRepository.countByRoleAndCreateAtBetween(Role.USER, startOfThisMonth, endOfThisMonth);
        long usersLastMonth = accountRepository.countByRoleAndCreateAtBetween(Role.USER, startOfLastMonth, endOfLastMonth);
        stats.setNewCustomers(new StatMetric(usersThisMonth, calculateGrowth(usersThisMonth, usersLastMonth)));

        // --- Card 4: Doanh thu tháng (Chỉ tính đơn đã Giao hoặc Hoàn thành) ---
        List<OrderStatus> revenueStatuses = Arrays.asList(OrderStatus.COMPLETED, OrderStatus.DELIVERED);
        BigDecimal revThisMonth = orderRepository.sumTotalAmountByStatusInAndOrderDateBetween(revenueStatuses, startOfThisMonth, endOfThisMonth);
        BigDecimal revLastMonth = orderRepository.sumTotalAmountByStatusInAndOrderDateBetween(revenueStatuses, startOfLastMonth, endOfLastMonth);
        stats.setMonthlyRevenue(new StatMetric(revThisMonth, calculateGrowth(revThisMonth.doubleValue(), revLastMonth.doubleValue())));

        return stats;
    }

    private List<RevenueChartData> getRevenueChartData() {
        List<RevenueChartData> data = new ArrayList<>();
        // Chỉ tính doanh thu các đơn đã thành công
        List<OrderStatus> revenueStatuses = Arrays.asList(OrderStatus.COMPLETED, OrderStatus.DELIVERED);
        YearMonth currentMonth = YearMonth.now();

        // Loop 6 tháng gần nhất (từ 5 tháng trước đến nay)
        for (int i = 5; i >= 0; i--) {
            YearMonth targetMonth = currentMonth.minusMonths(i);
            LocalDateTime start = targetMonth.atDay(1).atStartOfDay();
            LocalDateTime end = targetMonth.atEndOfMonth().atTime(23, 59, 59);

            BigDecimal revenue = orderRepository.sumTotalAmountByStatusInAndOrderDateBetween(revenueStatuses, start, end);

            // Frontend đang hiển thị đơn vị Tỷ (1.000.000.000) hoặc Triệu.
            // Ở đây tôi chia cho 1 tỷ để ra số nhỏ gọn (Ví dụ: 15.2 tỷ)
            BigDecimal displayRevenue = revenue.divide(BigDecimal.valueOf(1_000_000_000), 2, RoundingMode.HALF_UP);

            data.add(new RevenueChartData("Tháng " + targetMonth.getMonthValue(), displayRevenue));
        }
        return data;
    }

    private List<OrderStatusData> getOrderStatusChartData() {
        List<Object[]> rawData = orderRepository.countOrdersByStatusGroup();
        List<OrderStatusData> chartData = new ArrayList<>();

        for (Object[] row : rawData) {
            OrderStatus status = (OrderStatus) row[0];
            Long count = (Long) row[1];

            String label;
            String color;

            // Map màu sắc khớp với Frontend React (Tailwind colors converted to Hex)
            switch (status) {
                case COMPLETED:
                    label = "Hoàn thành";
                    color = "#16a34a"; // Green-600
                    break;
                case DELIVERED:
                    label = "Đã giao";
                    color = "#16a34a"; // Green-600 (Gộp màu với Completed)
                    break;
                case SHIPPING:
                    label = "Đang giao";
                    color = "#2563eb"; // Blue-600
                    break;
                case PENDING:
                case CONFIRMED:
                    label = "Đang xử lý";
                    color = "#ca8a04"; // Yellow-600
                    break;
                case CANCELLED:
                    label = "Đã hủy";
                    color = "#dc2626"; // Red-600
                    break;
                default:
                    label = "Khác";
                    color = "#6b7280"; // Gray-500
            }

            // (Tuỳ chọn) Bạn có thể gộp các trạng thái PENDING + CONFIRMED thành 1 item ở đây nếu muốn
            chartData.add(new OrderStatusData(label, count, color));
        }
        return chartData;
    }

    private List<RecentOrderDto> getRecentOrders() {
        // Lấy 5 đơn mới nhất
        List<Order> orders = orderRepository.findRecentOrders(PageRequest.of(0, 5));

        return orders.stream().map(o -> {
            // Logic lấy tên xe để hiển thị
            String carInfo = "Chưa có sản phẩm";
            if (o.getOrderDetails() != null && !o.getOrderDetails().isEmpty()) {
                OrderDetail firstDetail = o.getOrderDetails().get(0);
                if (firstDetail.getCar() != null) {
                    carInfo = firstDetail.getCar().getModel();
                    // Nếu đơn có nhiều hơn 1 loại xe
                    if (o.getOrderDetails().size() > 1) {
                        carInfo += " (+" + (o.getOrderDetails().size() - 1) + " xe khác)";
                    }
                }
            }

            return new RecentOrderDto(
                    o.getOrderId(),
                    o.getFullName(),
                    carInfo,
                    o.getOrderDate(),
                    o.getStatus().name(),
                    o.getTotalAmount()
            );
        }).toList();
    }

    private List<LowStockCarDto> getLowStockCars() {
        // Lấy top 5 xe có số lượng < 5 (Ngưỡng cảnh báo)
        List<Car> cars = carRepository.findByQuantityLessThanOrderByQuantityAsc(5, PageRequest.of(0, 5));
        return cars.stream().map(c -> new LowStockCarDto(
                c.getCarId(),
                c.getBrand() + " " + c.getModel(), // Ví dụ: "Toyota Camry"
                c.getQuantity()
        )).toList();
    }

    // Công thức tính % tăng trưởng: ((Mới - Cũ) / Cũ) * 100
    private double calculateGrowth(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100.0;
    }
}