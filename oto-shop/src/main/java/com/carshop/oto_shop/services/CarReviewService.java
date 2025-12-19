package com.carshop.oto_shop.services;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.BadRequestException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.dto.carreview.CarReviewRequest;
import com.carshop.oto_shop.dto.carreview.CarReviewResponse;
import com.carshop.oto_shop.entities.*;
import com.carshop.oto_shop.enums.OrderStatus;
import com.carshop.oto_shop.mappers.CarReviewMapper;
import com.carshop.oto_shop.repositories.CarRepository;
import com.carshop.oto_shop.repositories.CarReviewRepository;
import com.carshop.oto_shop.repositories.OrderDetailRepository;
import com.carshop.oto_shop.security.models.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarReviewService {
    private static final Logger logger = LoggerFactory.getLogger(CarReviewService.class);

    private final CarReviewRepository carReviewRepository;
    private final OrderDetailRepository orderDetailRepository;
    private final CarRepository carRepository;
    private final CarReviewMapper carReviewMapper;
    private final UserService userService; // Dùng để lấy thông tin User

    public CarReviewService(CarReviewRepository carReviewRepository,
                            OrderDetailRepository orderDetailRepository,
                            CarRepository carRepository,
                            CarReviewMapper carReviewMapper,
                            UserService userService) {
        this.carReviewRepository = carReviewRepository;
        this.orderDetailRepository = orderDetailRepository;
        this.carRepository = carRepository;
        this.carReviewMapper = carReviewMapper;
        this.userService = userService;
    }

    // ==================== 1. SUBMIT ĐÁNH GIÁ (LOGIC NGHIỆP VỤ) ====================
    @Transactional
    public CarReviewResponse submitReview(CarReviewRequest request) {
        // 1. Lấy OrderDetail
        OrderDetail orderDetail = orderDetailRepository.findById(request.getOrderDetailId())
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_DETAIL_NOT_FOUND));

        Order order = orderDetail.getOrder();

        // 2. Lấy User đang đăng nhập
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentUserEmail = userDetails.getUsername();
        // ✅ SỬ DỤNG HÀM MỚI ĐỂ LẤY ENTITY CỦA NGƯỜI DÙNG HIỆN TẠI
        User currentUser = userService.getUserEntityByEmail(currentUserEmail);

        // Lấy User Entity của Order
        User orderUser = order.getUser();

        // Kiểm tra xem người đang đánh giá có phải là người đặt đơn không
        if (!orderUser.getUserId().equals(currentUser.getUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED, "Bạn không có quyền đánh giá đơn hàng này.");
        }

        // 3. KIỂM TRA LOGIC CỐT LÕI: Trạng thái đơn hàng
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Chỉ đơn hàng ở trạng thái HOÀN THÀNH mới được phép đánh giá.");
        }

        // 4. KIỂM TRA LOGIC CỐT LÕI: Đã đánh giá item này chưa
        if (carReviewRepository.findByOrderDetail_OrderDetailId(orderDetail.getOrderDetailId()).isPresent()) {
            throw new BadRequestException("Sản phẩm này trong đơn hàng của bạn đã được đánh giá trước đó.");
        }

        // 5. Tạo Review
        CarReview review = carReviewMapper.toCarReview(request);
        review.setCar(orderDetail.getCar());
        review.setUser(currentUser);
        review.setOrderDetail(orderDetail);
        // Kiểm tra Rating phải trong khoảng 1-5
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) {
            throw new BadRequestException("Số sao đánh giá phải nằm trong khoảng từ 1 đến 5.");
        }

        CarReview savedReview = carReviewRepository.save(review);
        logger.info("New review submitted by user {} for car {}", currentUser.getUserId(), review.getCar().getCarId());

        // 6. Cập nhật thống kê cho Car (Hàm này chạy sau khi lưu Review thành công)
        updateCarAnalytics(savedReview.getCar().getCarId());

        return carReviewMapper.toCarReviewResponse(savedReview);
    }

    // ==================== 2. HÀM TÍNH TOÁN THỐNG KÊ (Nghiệp vụ quan trọng) ====================
    @Transactional
    public void updateCarAnalytics(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Gọi Repository để tính toán
        List<Object[]> result = carReviewRepository.calculateAverageRatingAndCountByCarId(carId);

        if (result != null && !result.isEmpty() && result.get(0)[0] != null) {
            // Lấy kết quả: result[0][0] là AVG, result[0][1] là COUNT
            Double avg = (Double) result.get(0)[0];
            Long count = (Long) result.get(0)[1];

            // Cập nhật Entity Car
            car.setAvgRating(Math.round(avg * 100.0) / 100.0); // Làm tròn 2 chữ số thập phân
            car.setReviewCount(count.intValue());
        } else {
            // Trường hợp chưa có đánh giá nào
            car.setAvgRating(0.0);
            car.setReviewCount(0);
        }

        carRepository.save(car);
        logger.info("Updated analytics for Car {}. Avg: {}, Count: {}", carId, car.getAvgRating(), car.getReviewCount());
    }

    // ==================== 3. LẤY TẤT CẢ ĐÁNH GIÁ CHO MỘT SẢN PHẨM ====================
    @Transactional
    public List<CarReviewResponse> getReviewsByCarId(Long carId) {
        // Lấy danh sách đánh giá đã được duyệt (nếu dùng trường isApproved)
        List<CarReview> reviews = carReviewRepository.findByCar_CarId(carId);

        return reviews.stream()
                .filter(CarReview::getIsApproved) // Chỉ hiển thị review đã được duyệt
                .map(carReviewMapper::toCarReviewResponse)
                .toList();
    }

    // ==================== 4. LẤY TẤT CẢ ĐÁNH GIÁ (ADMIN) ====================
    @Transactional
    public List<CarReviewResponse> getAllReviews() {
        List<CarReview> reviews = carReviewRepository.findAll();
        return reviews.stream()
                .map(carReviewMapper::toCarReviewResponse)
                .toList();
    }

    // ==================== 5. CẬP NHẬT TRẠNG THÁI DUYỆT (ADMIN) ====================
    @Transactional
    // ✅ Sửa kiểu dữ liệu ID từ Long -> String
    public CarReviewResponse updateReviewApprovalStatus(String reviewId, boolean isApproved) {
        CarReview review = carReviewRepository.findById(reviewId)
                // ✅ Sửa kiểu dữ liệu ID từ Long -> String
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        // ...
        if (review.getIsApproved() != isApproved) {
            review.setIsApproved(isApproved);
            CarReview savedReview = carReviewRepository.save(review);
            updateCarAnalytics(review.getCar().getCarId());
            return carReviewMapper.toCarReviewResponse(savedReview);
        }

        return carReviewMapper.toCarReviewResponse(review);
    }

    // ==================== 6. XOÁ ĐÁNH GIÁ (ADMIN) ====================
    @Transactional
    public void deleteReview(String reviewId) {
        CarReview review = carReviewRepository.findById(reviewId)
                .orElseThrow(() -> new AppException(ErrorCode.REVIEW_NOT_FOUND));

        Long carId = review.getCar().getCarId();

        carReviewRepository.delete(review);
        logger.info("Deleted review {}", reviewId);

        // BẮT BUỘC: Cập nhật lại thống kê xe
        updateCarAnalytics(carId);
    }

    // (Thêm hàm check đã review)
    @Transactional
    public boolean hasOrderDetailBeenReviewed(Long orderDetailId) {
        OrderDetail orderDetail = orderDetailRepository.findById(orderDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.ORDER_DETAIL_NOT_FOUND));

        // Kiểm tra trạng thái đơn hàng (đảm bảo chỉ COMPLETED mới có thể đánh giá)
        if (orderDetail.getOrder().getStatus() != OrderStatus.COMPLETED) {
            return false;
        }

        // Kiểm tra xem đã tồn tại review chưa
        return carReviewRepository.findByOrderDetail_OrderDetailId(orderDetailId).isPresent();
    }
}