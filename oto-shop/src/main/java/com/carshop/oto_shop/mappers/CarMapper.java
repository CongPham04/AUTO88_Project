package com.carshop.oto_shop.mappers;

import com.carshop.oto_shop.dto.car.CarRequest;
import com.carshop.oto_shop.dto.car.CarResponse;
import com.carshop.oto_shop.entities.Car;
import com.carshop.oto_shop.entities.CarImage;
import com.carshop.oto_shop.enums.CarStatus;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = {CarDetailMapper.class})
public abstract class CarMapper {

    // Inject biến từ application.properties
    // Giá trị này sẽ thay đổi tùy môi trường (localhost hoặc domain thật)
    @Value("${app.base-url}")
    protected String appBaseUrl;

    @Mapping(target = "carId", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "carDetail", ignore = true)
    @Mapping(target = "soldQuantity", constant = "0")
    @Mapping(target = "status", ignore = true)
    public abstract Car toCar(CarRequest carRequest);

    @Mapping(target = "imageUrls", expression = "java(mapImagesToUrls(car.getImages()))")
    @Mapping(target = "detail", source = "carDetail")
    public abstract CarResponse toCarResponse(Car car);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "carDetail", ignore = true)
    public abstract void updateCarRequest(CarRequest carRequest, @MappingTarget Car car);

    // ========================================================================
    // ✅ LOGIC NGHIỆP VỤ
    // ========================================================================
    @AfterMapping
    protected void calculateStatus(Car car, @MappingTarget CarResponse response) {
        if (car.getQuantity() != null && car.getQuantity() > 0) {
            response.setStatus(CarStatus.AVAILABLE);
        } else {
            response.setStatus(CarStatus.SOLD);
        }
    }

    // Helper method: Chuyển List<CarImage> thành List URL hoàn chỉnh
    protected List<String> mapImagesToUrls(List<CarImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }
        return images.stream()
                .map(img -> {
                    String path = img.getImageUrl();
                    if (path == null) return null;

                    // 1. Nếu là Link Online (Seeding data) -> Giữ nguyên
                    if (path.startsWith("http://") || path.startsWith("https://")) {
                        return path;
                    }

                    // 2. Nếu là File Local -> Ghép với appBaseUrl
                    String fileName = path;
                    if (path.contains("/") || path.contains("\\")) {
                        fileName = Paths.get(path).getFileName().toString();
                    }

                    // Kết quả: http://auto88.id.vn/carshop/api/cars/image/ten_anh.jpg
                    return appBaseUrl + "/api/cars/image/" + fileName;
                })
                .collect(Collectors.toList());
    }
}