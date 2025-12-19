package com.carshop.oto_shop.entities;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.Random;

@Entity
@Table(
        name = "car_reviews",
        uniqueConstraints = {
                // Đảm bảo mỗi OrderDetail (tức mỗi item đã mua) chỉ được đánh giá 1 lần
                @UniqueConstraint(name = "uk_review_order_detail", columnNames = "order_detail_id")
        }
)
public class CarReview {
    @Id
    @Column(name = "car_review_id", length = 6, nullable = false, updatable = false) // Đổi tên và length
    private String carReviewId; // ✅ Thay đổi kiểu Long sang String và tên id -> carReviewId

    // Liên kết với xe nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "car_id", nullable = false, foreignKey = @ForeignKey(name = "fk_car_reviews_car"))
    private Car car;

    // Liên kết với người dùng nào
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_car_reviews_user"))
    private User user;

    // Liên kết với chính xác chi tiết đơn hàng đã mua (BẮT BUỘC)
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_detail_id", nullable = false, unique = true, foreignKey = @ForeignKey(name = "fk_car_reviews_order_detail"))
    private OrderDetail orderDetail;

    @Column(name = "rating", nullable = false) // Số sao từ 1 đến 5
    private Integer rating;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Thêm trường admin quản trị (Optional: xem mục Admin ở dưới)
    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = true; // Mặc định là duyệt luôn

    public CarReview() {
    }

    @PrePersist
    public void generateId() {
        if (this.carReviewId == null) {
            // ✅ Logic sinh ID 6 chữ số
            Random random = new Random();
            int sixDigitNumber = 100000 + random.nextInt(900000);
            this.carReviewId = String.valueOf(sixDigitNumber);
        }
    }

    public String getCarReviewId() {
        return carReviewId;
    }

    public void setCarReviewId(String carReviewId) {
        this.carReviewId = carReviewId;
    }

    public Car getCar() {
        return car;
    }

    public void setCar(Car car) {
        this.car = car;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public OrderDetail getOrderDetail() {
        return orderDetail;
    }

    public void setOrderDetail(OrderDetail orderDetail) {
        this.orderDetail = orderDetail;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
    }
}