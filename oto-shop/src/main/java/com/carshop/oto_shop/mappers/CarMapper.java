package com.carshop.oto_shop.mappers;

import com.carshop.oto_shop.dto.car.CarRequest;
import com.carshop.oto_shop.dto.car.CarResponse;
import com.carshop.oto_shop.entities.Car;
import com.carshop.oto_shop.entities.CarImage;
import com.carshop.oto_shop.enums.CarStatus;
import org.mapstruct.*;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
// Cần thêm import này để dùng Paths
import java.nio.file.Paths;


@Mapper(componentModel = "spring", uses = {CarDetailMapper.class}) // uses CarDetailMapper để map detail
public interface CarMapper {
    // Constant này nên để ở đây hoặc 1 file Config chung
    String BASE_IMAGE_API = "http://localhost:8080/carshop/api/cars/image/";

    @Mapping(target = "carId", ignore = true)
    @Mapping(target = "images", ignore = true) // Sẽ xử lý trong service
    @Mapping(target = "carDetail", ignore = true) // Sẽ xử lý gán quan hệ 2 chiều trong service
    @Mapping(target = "soldQuantity", constant = "0")
    @Mapping(target = "status", ignore = true)
    Car toCar(CarRequest carRequest);

    @Mapping(target = "imageUrls", expression = "java(mapImagesToUrls(car.getImages()))")
    @Mapping(target = "detail", source = "carDetail") // Map entity detail -> dto detail
    CarResponse toCarResponse(Car car);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "carDetail", ignore = true) // Update detail riêng
    void updateCarRequest(CarRequest carRequest, @MappingTarget Car car);

    // ========================================================================
    // ✅ LOGIC NGHIỆP VỤ: Xử lý Status dựa trên Quantity ngay trong Mapper
    // ========================================================================
    @AfterMapping
    default void calculateStatus(Car car, @MappingTarget CarResponse response) {
        if (car.getQuantity() != null && car.getQuantity() > 0) {
            response.setStatus(CarStatus.AVAILABLE);
        } else {
            // Nếu quantity <= 0 hoặc null -> SOLD
            response.setStatus(CarStatus.SOLD);
        }
    }

    // Helper method để chuyển List<CarImage> thành List<String> URL
    // ✅ CẬP NHẬT LOGIC MAP ẢNH TẠI ĐÂY
    default List<String> mapImagesToUrls(List<CarImage> images) {
        if (images == null || images.isEmpty()) {
            return Collections.emptyList();
        }
        return images.stream()
                .map(img -> {
                    String path = img.getImageUrl();
                    if (path == null) return null;

                    // 1. Nếu là Link Online (Seeding data) -> Trả về nguyên gốc
                    if (path.startsWith("http://") || path.startsWith("https://")) {
                        return path;
                    }

                    // 2. Nếu là File Local (Upload) -> Tạo link API
                    // path trong DB có thể là: "uploads/cars/123_abc.jpg"
                    // Cần lấy tên file: "123_abc.jpg"
                    String fileName = path;
                    if (path.contains("/") || path.contains("\\")) {
                        fileName = Paths.get(path).getFileName().toString();
                    }
                    // Trả về link: http://localhost:8080/carshop/api/cars/image/123_abc.jpg
                    return BASE_IMAGE_API + fileName;
                })
                .collect(Collectors.toList());
    }
}
