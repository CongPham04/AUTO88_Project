package com.carshop.oto_shop.mappers;

import com.carshop.oto_shop.dto.carreview.CarReviewRequest;
import com.carshop.oto_shop.dto.carreview.CarReviewResponse;
import com.carshop.oto_shop.entities.CarReview;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CarReviewMapper {

    // Request -> Entity
    @Mapping(target = "carReviewId", ignore = true) // ✅ ID mới, ignore
    @Mapping(target = "car", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "orderDetail", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isApproved", ignore = true)
    // ✅ THÊM: Map rating và comment (khắc phục Unmapped target properties)
    @Mapping(source = "rating", target = "rating")
    @Mapping(source = "comment", target = "comment")
    CarReview toCarReview(CarReviewRequest request);

    // Entity -> Response
    @Mapping(source = "carReviewId", target = "carReviewId") // ✅ Ánh xạ ID mới
    @Mapping(source = "car.carId", target = "carId")
    @Mapping(source = "car.model", target = "carModel")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.fullName", target = "userFullName")
    @Mapping(source = "user.avatarUrl", target = "userAvatarUrl")
    @Mapping(source = "orderDetail.orderDetailId", target = "orderDetailId")
    @Mapping(source = "isApproved", target = "isApproved")
    CarReviewResponse toCarReviewResponse(CarReview carReview);
}