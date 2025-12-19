package com.carshop.oto_shop.dto.carreview;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CarReviewRequest {

    @NotNull(message = "ID chi tiết đơn hàng không được để trống")
    private Long orderDetailId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Số sao phải lớn hơn hoặc bằng 1")
    @Max(value = 5, message = "Số sao phải nhỏ hơn hoặc bằng 5")
    private Integer rating;

    private String comment;

    public CarReviewRequest() {
    }

    public CarReviewRequest(Long orderDetailId, Integer rating, String comment) {
        this.orderDetailId = orderDetailId;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters
    public Long getOrderDetailId() { return orderDetailId; }
    public Integer getRating() { return rating; }
    public String getComment() { return comment; }

    // Setters
    public void setOrderDetailId(Long orderDetailId) { this.orderDetailId = orderDetailId; }
    public void setRating(Integer rating) { this.rating = rating; }
    public void setComment(String comment) { this.comment = comment; }
}