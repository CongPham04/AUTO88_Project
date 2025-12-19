package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.CarReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CarReviewRepository extends JpaRepository<CarReview, String> {

    // Tìm kiếm đánh giá dựa trên OrderDetailId để kiểm tra đã đánh giá chưa
    Optional<CarReview> findByOrderDetail_OrderDetailId(Long orderDetailId);

    // Lấy tất cả đánh giá cho một xe
    List<CarReview> findByCar_CarId(Long carId);

    // ✅ Hàm nghiệp vụ: Tính trung bình và tổng số lượng đánh giá cho một xe
    // Chỉ tính những đánh giá đã được Admin duyệt (nếu có logic duyệt)
    @Query("SELECT AVG(r.rating), COUNT(r) FROM CarReview r WHERE r.car.carId = :carId AND r.isApproved = true")
    List<Object[]> calculateAverageRatingAndCountByCarId(@Param("carId") Long carId);
}