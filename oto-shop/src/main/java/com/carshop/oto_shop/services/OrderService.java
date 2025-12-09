package com.carshop.oto_shop.services;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.BadRequestException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.dto.order.OrderRequest;
import com.carshop.oto_shop.dto.order.OrderResponse;
import com.carshop.oto_shop.dto.order.OrderUpdateRequest;
import com.carshop.oto_shop.dto.orderdetail.OrderDetailRequest;
import com.carshop.oto_shop.entities.*;
import com.carshop.oto_shop.enums.OrderStatus;
import com.carshop.oto_shop.mappers.OrderMapper;
import com.carshop.oto_shop.repositories.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final CarRepository carRepository;
    private final OrderMapper orderMapper;
    // ✅ Inject EmailService
    private final EmailService emailService;

    public OrderService(OrderRepository orderRepository,
                       OrderDetailRepository orderDetailRepository,
                       PaymentRepository paymentRepository,
                       UserRepository userRepository,
                       CarRepository carRepository,
                       OrderMapper orderMapper,
                        EmailService emailService) {
        this.orderRepository = orderRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.carRepository = carRepository;
        this.orderMapper = orderMapper;
        this.emailService = emailService;
    }

    // ==================== 1. TẠO ĐƠN HÀNG (Trừ Tồn Kho) ====================
    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        try {
            User user = userRepository.findById(orderRequest.getUserId())
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            Order order = orderMapper.toOrder(orderRequest);
            order.setUser(user);
            if (order.getShippingFee() == null) order.setShippingFee(BigDecimal.ZERO);
            if (order.getTax() == null) order.setTax(BigDecimal.ZERO);

            List<OrderDetail> orderDetails = new ArrayList<>();
            BigDecimal subtotal = BigDecimal.ZERO;

            for (OrderDetailRequest detailRequest : orderRequest.getOrderDetails()) {
                // Lock row để tránh Race Condition (nếu cần thiết có thể dùng PESSIMISTIC_WRITE)
                Car car = carRepository.findById(detailRequest.getCarId())
                        .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

                // ✅ LOGIC TỒN KHO: Kiểm tra số lượng
                if (car.getQuantity() < detailRequest.getQuantity()) {
                    throw new BadRequestException("Sản phẩm " + car.getModel() + " không đủ hàng trong kho! (Còn: " + car.getQuantity() + ")");
                }

                // ✅ LOGIC TỒN KHO: Trừ tồn kho ngay khi đặt
                car.setQuantity(car.getQuantity() - detailRequest.getQuantity());

                // Cập nhật trạng thái xe nếu hết hàng
                car.updateStatusBasedOnQuantity();
                carRepository.save(car);

                OrderDetail orderDetail = new OrderDetail();
                orderDetail.setOrder(order);
                orderDetail.setCar(car);
                orderDetail.setQuantity(detailRequest.getQuantity());
                orderDetail.setColorName(detailRequest.getColorName());
                orderDetail.setPrice(car.getPrice());

                BigDecimal itemTotal = car.getPrice().multiply(BigDecimal.valueOf(detailRequest.getQuantity()));
                subtotal = subtotal.add(itemTotal);
                orderDetails.add(orderDetail);
            }

            order.setSubtotal(subtotal);
            order.setTotalAmount(subtotal.add(order.getShippingFee()).add(order.getTax()));
            order.setOrderDetails(orderDetails);

            Payment payment = new Payment();
            payment.setOrder(order);
            payment.setAmount(order.getTotalAmount());
            payment.setPaymentMethod(orderRequest.getPaymentMethod());
            order.setPayment(payment);

            Order savedOrder = orderRepository.save(order);
            logger.info("Created order {}", savedOrder.getOrderId());

            // ✅ GỬI EMAIL XÁC NHẬN (Async)
            // Đặt trong try-catch riêng để lỗi gửi mail không làm rollback đơn hàng
            try {
                emailService.sendOrderConfirmation(savedOrder);
            } catch (Exception e) {
                logger.error("Failed to send order confirmation email", e);
            }

            return orderMapper.toOrderResponse(savedOrder);
        } catch (AppException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error creating order: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNKNOWN);
        }
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));
        return orderMapper.toOrderResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByUserId(String userId) {
        List<Order> orders = orderRepository.findByUser_UserId(userId);
        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        List<Order> orders = orderRepository.findByStatus(status);
        return orders.stream()
                .map(orderMapper::toOrderResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrder(String orderId, OrderUpdateRequest orderUpdateRequest) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

            // Update shipping information if provided
            if (orderUpdateRequest.getFullName() != null) {
                order.setFullName(orderUpdateRequest.getFullName());
            }
            if (orderUpdateRequest.getEmail() != null) {
                order.setEmail(orderUpdateRequest.getEmail());
            }
            if (orderUpdateRequest.getPhone() != null) {
                order.setPhone(orderUpdateRequest.getPhone());
            }
            if (orderUpdateRequest.getAddress() != null) {
                order.setAddress(orderUpdateRequest.getAddress());
            }
            if (orderUpdateRequest.getCity() != null) {
                order.setCity(orderUpdateRequest.getCity());
            }
            if (orderUpdateRequest.getDistrict() != null) {
                order.setDistrict(orderUpdateRequest.getDistrict());
            }
            if (orderUpdateRequest.getWard() != null) {
                order.setWard(orderUpdateRequest.getWard());
            }
            if (orderUpdateRequest.getNote() != null) {
                order.setNote(orderUpdateRequest.getNote());
            }

            // Update financial information if provided
            if (orderUpdateRequest.getShippingFee() != null) {
                order.setShippingFee(orderUpdateRequest.getShippingFee());
            }
            if (orderUpdateRequest.getTax() != null) {
                order.setTax(orderUpdateRequest.getTax());
            }

            // Recalculate total amount if shipping fee or tax changed
            if (orderUpdateRequest.getShippingFee() != null || orderUpdateRequest.getTax() != null) {
                order.setTotalAmount(order.getSubtotal().add(order.getShippingFee()).add(order.getTax()));
            }

            Order updatedOrder = orderRepository.save(order);
            logger.info("Updated order {} information", orderId);

            return orderMapper.toOrderResponse(updatedOrder);
        } catch (DataIntegrityViolationException e) {
            String message = e.getMostSpecificCause().getMessage();
            logger.error("DataIntegrityViolationException caught: {}", message);

            if (message != null) {
                if (message.contains("cannot be null")) {
                    String field = message.substring(message.indexOf("'") + 1, message.lastIndexOf("'"));
                    throw new BadRequestException(field + " không được để trống!");
                } else {
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
            } else {
                throw new AppException(ErrorCode.UNKNOWN);
            }
        } catch (Exception e) {
            logger.error("Error updating order: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNKNOWN);
        }
    }

    // ==================== 2. CẬP NHẬT TRẠNG THÁI (Cộng đã bán, Hoàn tồn kho) ====================
    @Transactional
    public OrderResponse updateOrderStatus(String orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        OrderStatus oldStatus = order.getStatus();

        // Không cho phép cập nhật nếu đơn đã hoàn thành hoặc đã hủy (Logic chặt chẽ)
        if (oldStatus == OrderStatus.COMPLETED || oldStatus == OrderStatus.CANCELLED) {
            throw new BadRequestException("Không thể cập nhật trạng thái đơn hàng đã hoàn thành hoặc đã hủy!");
        }

        // ✅ LOGIC 1: Nếu Huỷ đơn (CANCELLED) -> Hoàn lại tồn kho
        if (newStatus == OrderStatus.CANCELLED) {
            return cancelOrderInternal(order, "Huỷ bởi Admin/Hệ thống");
        }

        // ✅ LOGIC 2: Nếu Hoàn thành (COMPLETED/DELIVERED) -> Tăng số lượng đã bán (Sold Quantity)
        // Chỉ tăng 1 lần khi chuyển sang trạng thái "thành công" đầu tiên
        if ((newStatus == OrderStatus.DELIVERED || newStatus == OrderStatus.COMPLETED) &&
                (oldStatus != OrderStatus.DELIVERED && oldStatus != OrderStatus.COMPLETED)) {

            for (OrderDetail detail : order.getOrderDetails()) {
                Car car = detail.getCar();
                // Tăng số lượng đã bán
                car.setSoldQuantity(car.getSoldQuantity() + detail.getQuantity());
                carRepository.save(car);
            }
        }

        order.setStatus(newStatus);
        Order updatedOrder = orderRepository.save(order);
        logger.info("Updated order {} status to {}", orderId, newStatus);
        // ✅ GỬI EMAIL THÔNG BÁO CẬP NHẬT TRẠNG THÁI
        try {
            emailService.sendOrderStatusUpdate(updatedOrder);
        } catch (Exception e) {
            logger.error("Failed to send status update email", e);
        }
        return orderMapper.toOrderResponse(updatedOrder);
    }

    // ==================== 3. HỦY ĐƠN HÀNG (User Cancel) ====================
    @Transactional
    public OrderResponse cancelOrder(String orderId, String cancelReason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

        // User chỉ được hủy khi đơn còn PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new AppException(ErrorCode.ORDER_CANNOT_BE_CANCELLED);
        }

        // Nếu cancelReason null hoặc rỗng, gán mặc định
        String finalReason = (cancelReason == null || cancelReason.trim().isEmpty())
                ? "Khách hàng yêu cầu hủy (Không có lý do)"
                : cancelReason;

        return cancelOrderInternal(order, finalReason);
    }

    // Hàm nội bộ để xử lý logic hoàn kho khi hủy
    private OrderResponse cancelOrderInternal(Order order, String reason) {
        // ✅ LOGIC HOÀN KHO: Cộng lại số lượng vào kho
        for (OrderDetail detail : order.getOrderDetails()) {
            Car car = detail.getCar();
            car.setQuantity(car.getQuantity() + detail.getQuantity());
            car.updateStatusBasedOnQuantity(); // Cập nhật lại status xe (AVAILABLE) nếu cần
            carRepository.save(car);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        Order updatedOrder = orderRepository.save(order);
        logger.info("Order {} cancelled. Reason: {}", order.getOrderId(), reason);
        // 3. ✅ GỬI EMAIL THÔNG BÁO HỦY (Async)
        try {
            emailService.sendOrderCancellationEmail(updatedOrder);
        } catch (Exception e) {
            logger.error("Failed to send cancellation email for order {}", order.getOrderId(), e);
            // Không throw exception để tránh rollback giao dịch hủy đơn chỉ vì lỗi gửi mail
        }
        return orderMapper.toOrderResponse(updatedOrder);
    }

    @Transactional
    public void deleteOrder(String orderId) {
        try {
            Order order = orderRepository.findById(orderId)
                    .orElseThrow(() -> new AppException(ErrorCode.ORDER_NOT_FOUND));

            orderRepository.delete(order);
            logger.info("Deleted order {}", orderId);
        } catch (DataIntegrityViolationException e) {
            String message = e.getMostSpecificCause().getMessage();
            logger.error("DataIntegrityViolationException caught: {}", message);

            if (message != null) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            } else {
                throw new AppException(ErrorCode.UNKNOWN);
            }
        } catch (Exception e) {
            logger.error("Error deleting order: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNKNOWN);
        }
    }
}
