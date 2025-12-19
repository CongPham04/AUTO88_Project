package com.carshop.oto_shop.controllers;

import com.carshop.oto_shop.common.response.ApiResponse;
import com.carshop.oto_shop.dto.carreview.CarReviewRequest;
import com.carshop.oto_shop.dto.carreview.CarReviewResponse;
import com.carshop.oto_shop.services.CarReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Đặt tag cho nhóm API này trong Swagger UI
@Tag(name = "Review", description = "Quản lý Đánh giá Sản phẩm Ô tô")
@RestController
@RequestMapping("/api/reviews")
public class CarReviewController {
    private final CarReviewService carReviewService;

    public CarReviewController(CarReviewService carReviewService) {
        this.carReviewService = carReviewService;
    }

    // ==================== A. USER ENDPOINTS ====================

    // 1. POST: Khách hàng gửi đánh giá (Cần: USER, ADMIN - Phân quyền trong SecurityConfig)
    @Operation(
            summary = "Gửi đánh giá sản phẩm (Review)",
            description = "Chỉ cho phép người dùng đã mua hàng và đơn hàng ở trạng thái COMPLETED mới được đánh giá. ID là ID của OrderDetail."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<CarReviewResponse>> submitReview(@Valid @RequestBody CarReviewRequest request) {
        CarReviewResponse response = carReviewService.submitReview(request);
        // ✅ SỬA: Trả về ApiResponse
        return new ResponseEntity<>(ApiResponse.success("Gửi đánh giá thành công!", response), HttpStatus.CREATED);
    }

    // 2. GET: Lấy tất cả đánh giá cho một xe (PUBLIC)
    @Operation(
            summary = "Lấy danh sách đánh giá công khai theo ID xe",
            description = "API công khai, trả về các đánh giá đã được duyệt (isApproved=true) cho một chiếc xe."
    )
    @GetMapping("/car/{carId}")
    public ResponseEntity<ApiResponse<List<CarReviewResponse>>> getReviewsByCarId(@PathVariable Long carId) {
        List<CarReviewResponse> reviews = carReviewService.getReviewsByCarId(carId);
        // ✅ SỬA: Trả về ApiResponse
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá thành công!", reviews));
    }

    // 3. GET: Kiểm tra một OrderDetail đã được đánh giá chưa (Cần: USER, ADMIN - Phân quyền trong SecurityConfig)
    @Operation(
            summary = "Kiểm tra trạng thái đánh giá của một chi tiết đơn hàng",
            description = "Dùng cho Frontend để xác định xem nút 'Đánh giá' có nên được hiển thị hay không (Kiểm tra OrderStatus=COMPLETED và đã tồn tại review chưa)."
    )
    @GetMapping("/order-detail/{orderDetailId}/check")
    public ResponseEntity<ApiResponse<Boolean>> hasOrderDetailBeenReviewed(@PathVariable Long orderDetailId) {
        boolean reviewed = carReviewService.hasOrderDetailBeenReviewed(orderDetailId);
        // ✅ SỬA: Trả về ApiResponse
        return ResponseEntity.ok(ApiResponse.success("Kiểm tra trạng thái đánh giá thành công!", reviewed));
    }

    // ==================== B. ADMIN MANAGEMENT ENDPOINTS ====================

    // 4. GET: Lấy TẤT CẢ đánh giá (Chỉ ADMIN - Phân quyền trong SecurityConfig)
    @Operation(
            summary = "ADMIN: Lấy tất cả đánh giá của hệ thống",
            description = "Dùng cho Admin Dashboard để quản trị, bao gồm cả những đánh giá chưa duyệt."
    )
    @GetMapping // /api/reviews
    public ResponseEntity<ApiResponse<List<CarReviewResponse>>> getAllReviews() {
        List<CarReviewResponse> reviews = carReviewService.getAllReviews();
        // ✅ SỬA: Trả về ApiResponse
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đánh giá toàn hệ thống thành công!", reviews));
    }

    // 5. PATCH: Duyệt/Ẩn đánh giá (Chỉ ADMIN - Phân quyền trong SecurityConfig)
    @Operation(
            summary = "ADMIN: Duyệt (Approve) hoặc Ẩn (Hide) đánh giá",
            description = "Cập nhật trạng thái duyệt của một đánh giá và tự động tính toán lại điểm trung bình của xe."
    )
    @PatchMapping("/{reviewId}/approve")
    public ResponseEntity<ApiResponse<CarReviewResponse>> setReviewApprovalStatus(
            @PathVariable String reviewId,
            @RequestParam boolean isApproved) {
        CarReviewResponse response = carReviewService.updateReviewApprovalStatus(reviewId, isApproved);
        // ✅ SỬA: Trả về ApiResponse
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái duyệt thành công!", response));
    }

    // 6. DELETE: Xóa vật lý đánh giá (Chỉ ADMIN - Phân quyền trong SecurityConfig)
    @Operation(
            summary = "ADMIN: Xóa vĩnh viễn đánh giá",
            description = "Xóa một đánh giá khỏi hệ thống và tự động tính toán lại điểm trung bình của xe."
    )
    @DeleteMapping("/{reviewId}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable String reviewId) {
        carReviewService.deleteReview(reviewId);
        // ✅ SỬA: Trả về ApiResponse với data=null (Void)
        return ResponseEntity.ok(ApiResponse.success("Xóa đánh giá thành công!"));
    }
}