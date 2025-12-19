package com.carshop.oto_shop.dto.carreview;

import java.time.LocalDateTime;

public class CarReviewResponse {
    private String carReviewId; // ✅ Thay đổi từ Long id -> String carReviewId
    private Long carId;
    private String carModel;
    private String userId;
    private String userFullName;
    private String userAvatarUrl;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    private Boolean isApproved;
    private Long orderDetailId;

    public CarReviewResponse() {
    }

    public CarReviewResponse(String carReviewId, Long carId, String carModel, String userId, String userFullName, String userAvatarUrl, Integer rating, String comment, LocalDateTime createdAt, Boolean isApproved, Long orderDetailId) {
        this.carReviewId = carReviewId;
        this.carId = carId;
        this.carModel = carModel;
        this.userId = userId;
        this.userFullName = userFullName;
        this.userAvatarUrl = userAvatarUrl;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
        this.isApproved = isApproved;
        this.orderDetailId = orderDetailId;
    }

    // Getters
    public String getCarReviewId() { return carReviewId; }
    public Long getCarId() { return carId; }
    public String getCarModel() { return carModel; }
    public String getUserId() { return userId; }
    public String getUserFullName() { return userFullName; }
    public String getUserAvatarUrl() { return userAvatarUrl; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public Boolean getIsApproved() { return isApproved; }
    public Long getOrderDetailId() { return orderDetailId; }

    // Setters
    public void setCarReviewId(String carReviewId) { this.carReviewId = carReviewId; }
    public void setCarId(Long carId) { this.carId = carId; }
    public void setCarModel(String carModel) { this.carModel = carModel; }
    public void setUserId(String userId) { this.userId = userId; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }
    public void setUserAvatarUrl(String userAvatarUrl) { this.userAvatarUrl = userAvatarUrl; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setIsApproved(Boolean isApproved) { this.isApproved = isApproved; }
    public void setOrderDetailId(Long orderDetailId) { this.orderDetailId = orderDetailId; }
}