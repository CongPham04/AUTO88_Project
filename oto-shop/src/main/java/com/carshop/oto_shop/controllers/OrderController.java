package com.carshop.oto_shop.controllers;

import com.carshop.oto_shop.common.response.ApiResponse;
import com.carshop.oto_shop.dto.order.OrderRequest;
import com.carshop.oto_shop.dto.order.OrderResponse;
import com.carshop.oto_shop.dto.order.OrderUpdateRequest;
import com.carshop.oto_shop.dto.orderdetail.OrderDetailResponse;
import com.carshop.oto_shop.enums.OrderStatus;
import com.carshop.oto_shop.services.OrderDetailService;
import com.carshop.oto_shop.services.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "OrderController", description = "Quản lý đơn hàng và chi tiết đơn hàng")
public class OrderController {
    private final OrderService orderService;
    private final OrderDetailService orderDetailService; // Inject thêm

    public OrderController(OrderService orderService, OrderDetailService orderDetailService) {
        this.orderService = orderService;
        this.orderDetailService = orderDetailService;
    }

    // ==================== ORDER CRUD ====================
    @Operation(summary = "Create order", description = "API create new order with order details and payment")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        return ResponseEntity.ok(ApiResponse.success("Tạo đơn hàng thành công!", orderService.createOrder(orderRequest)));
    }

    @Operation(summary = "Get order by ID", description = "API get order detail by order ID")
    @GetMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin đơn hàng thành công!", orderService.getOrder(orderId)));
    }

    @Operation(summary = "Get all orders", description = "API get all orders")
    @GetMapping
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAllOrders() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng thành công!", orderService.getAllOrders()));
    }

    @Operation(summary = "Update order", description = "API update order information (shipping address, contact, fees)")
    @PutMapping("/{orderId}")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrder(@PathVariable String orderId, @Valid @RequestBody OrderUpdateRequest orderUpdateRequest) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật đơn hàng thành công!", orderService.updateOrder(orderId, orderUpdateRequest)));
    }

    @Operation(summary = "Delete order", description = "API delete order")
    @DeleteMapping("/{orderId}")
    public ResponseEntity<ApiResponse<Void>> deleteOrder(@PathVariable String orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success("Xoá đơn hàng thành công!"));
    }

    // ==================== ORDER ACTIONS (Status/Cancel) ====================
    @Operation(summary = "Update order status", description = "API update order status")
    @PatchMapping("/{orderId}/status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(@PathVariable String orderId, @RequestParam OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái đơn hàng thành công!", orderService.updateOrderStatus(orderId, status)));
    }

    @Operation(summary = "User cancel order", description = "API for user to cancel their order")
    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable String orderId, @RequestBody(required = false) String cancelReason) {
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn hàng thành công!", orderService.cancelOrder(orderId, cancelReason)));
    }

    @Operation(summary = "Get orders by user ID", description = "API get all orders by user ID")
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng của người dùng thành công!", orderService.getOrdersByUserId(userId)));
    }

    @Operation(summary = "Get orders by status", description = "API get all orders by status (PENDING, CONFIRMED, SHIPPING, DELIVERED, CANCELLED, COMPLETED)")
    @GetMapping("/status/{status}")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn hàng theo trạng thái thành công!", orderService.getOrdersByStatus(status)));
    }

    // ==================== ORDER DETAILS (Gộp từ OrderDetailController) ====================

    @Operation(summary = "Get order details by order ID")
    @GetMapping("/{orderId}/details") // URL: /api/orders/{orderId}/details
    public ResponseEntity<ApiResponse<List<OrderDetailResponse>>> getOrderDetailsByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chi tiết đơn hàng thành công!", orderDetailService.getOrderDetailsByOrderId(orderId)));
    }

    @Operation(summary = "Get order detail by detail ID")
    @GetMapping("/details/{orderDetailId}") // URL: /api/orders/details/{id}
    public ResponseEntity<ApiResponse<OrderDetailResponse>> getOrderDetail(@PathVariable Long orderDetailId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết đơn hàng thành công!", orderDetailService.getOrderDetail(orderDetailId)));
    }

    @Operation(summary = "Delete order detail")
    @DeleteMapping("/details/{orderDetailId}")
    public ResponseEntity<ApiResponse<Void>> deleteOrderDetail(@PathVariable Long orderDetailId) {
        orderDetailService.deleteOrderDetail(orderDetailId);
        return ResponseEntity.ok(ApiResponse.success("Xoá chi tiết đơn hàng thành công!"));
    }
}