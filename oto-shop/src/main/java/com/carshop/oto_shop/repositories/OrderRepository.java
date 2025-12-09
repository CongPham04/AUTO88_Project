package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.Order;
import com.carshop.oto_shop.enums.OrderStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByUser_UserId(String userId);
    List<Order> findByStatus(OrderStatus status);
    // --- DASHBOARD QUERIES ---

    // 1. Đếm số đơn hàng trong khoảng thời gian (Dùng cho Card "Đơn hàng tháng này")
    long countByOrderDateBetween(LocalDateTime start, LocalDateTime end);

    // 2. Tính tổng doanh thu của các đơn hàng "Thành công" trong khoảng thời gian (Dùng cho Card "Doanh thu" & Biểu đồ cột)
    // COALESCE để xử lý null nếu không có đơn nào
    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status IN (:statuses) AND o.orderDate BETWEEN :start AND :end")
    BigDecimal sumTotalAmountByStatusInAndOrderDateBetween(@Param("statuses") List<OrderStatus> statuses,
                                                           @Param("start") LocalDateTime start,
                                                           @Param("end") LocalDateTime end);

    // 3. Đếm số lượng đơn theo từng trạng thái (Dùng cho Biểu đồ tròn)
    // Trả về List<Object[]>: [0] = Status (Enum), [1] = Count (Long)
    @Query("SELECT o.status, COUNT(o) FROM Order o GROUP BY o.status")
    List<Object[]> countOrdersByStatusGroup();

    // 4. Lấy danh sách đơn hàng mới nhất (Dùng cho bảng "Đơn hàng gần đây")
    @Query("SELECT o FROM Order o ORDER BY o.orderDate DESC")
    List<Order> findRecentOrders(Pageable pageable);
}
