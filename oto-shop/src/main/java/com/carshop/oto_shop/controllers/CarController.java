package com.carshop.oto_shop.controllers;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.common.response.ApiResponse;
import com.carshop.oto_shop.dto.car.CarRequest;
import com.carshop.oto_shop.dto.car.CarResponse;
import com.carshop.oto_shop.dto.cardetail.CarDetailRequest;
import com.carshop.oto_shop.dto.cardetail.CarDetailResponse;
import com.carshop.oto_shop.enums.Brand;
import com.carshop.oto_shop.enums.Category;
import com.carshop.oto_shop.services.CarDetailService;
import com.carshop.oto_shop.services.CarService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cars")
@Tag(name = "CarController", description = "Quản lý xe, chi tiết xe, hình ảnh và tìm kiếm")
public class CarController {
    private final CarService carService;
    private final CarDetailService carDetailService;

    public CarController(CarService carService, CarDetailService carDetailService) {
        this.carService = carService;
        this.carDetailService = carDetailService;
    }

    // ==================== 1. UNIFIED CAR CRUD (XE + ẢNH + CHI TIẾT + MÀU) ====================

    @Operation(summary = "Lấy danh sách tất cả xe")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CarResponse>>> getAllCars() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách sản phẩm thành công!", carService.getAllCars()));
    }

    @Operation(summary = "Lấy thông tin xe theo ID (Bao gồm chi tiết, ảnh, màu)")
    @GetMapping(value = "/{carId}")
    public ResponseEntity<ApiResponse<CarResponse>> getCar(@PathVariable("carId") Long carId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy ra sản phẩm thành công!", carService.getCar(carId)));
    }

    @Operation(summary = "Tạo mới xe (Gộp: Xe, Chi tiết, Nhiều ảnh, Nhiều màu)",
            description = "Sử dụng multipart/form-data. " +
                    "Ví dụ field: model='C300', quantity=5, colors='RED,BLACK', " +
                    "detail.engine='V6', detail.horsepower=300, imageFiles=[file1, file2]")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> createCar(
            @Parameter(content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE))
            @Valid @ModelAttribute CarRequest carRequest) {

        carService.createCar(carRequest);
        return ResponseEntity.ok(ApiResponse.success("Thêm sản phẩm thành công!"));
    }

    @Operation(summary = "Cập nhật xe (Gộp)",
            description = "Cập nhật thông tin, số lượng tồn kho (tự đổi status), thông số kỹ thuật và thêm ảnh mới.")
    @PutMapping(value = "/{carId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Void>> updateCar(
            @PathVariable("carId") Long carId,
            @Valid @ModelAttribute CarRequest carRequest) {

        carService.updateCar(carRequest, carId);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật sản phẩm thành công!"));
    }

    @Operation(summary = "Xoá xe", description = "Xoá xe sẽ xoá luôn chi tiết xe và các ảnh liên quan.")
    @DeleteMapping(value = "/{carId}")
    public ResponseEntity<ApiResponse<Void>> deleteCar(@PathVariable("carId") Long carId) {
        carService.deleteCar(carId);
        return ResponseEntity.ok(ApiResponse.success("Xoá sản phẩm thành công!"));
    }

    // ==================== 2. FILTERS & SEARCH ====================

    @Operation(summary = "Lọc xe theo Hãng (Brand)")
    @GetMapping("/brand/{brand}")
    public ResponseEntity<ApiResponse<List<CarResponse>>> getCarsByBrand(@PathVariable("brand") Brand brand) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách xe theo brand thành công!", carService.getCarsByBrand(brand)));
    }

    @Operation(summary = "Lọc xe theo Loại (Category)")
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<List<CarResponse>>> getCarsByCategory(@PathVariable("category") Category category) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách xe theo category thành công!", carService.getCarsByCategory(category)));
    }

    @Operation(summary = "Tìm kiếm nâng cao", description = "Tìm theo từ khoá, hãng, loại, màu sắc, khoảng giá, năm sản xuất")
    @GetMapping("/search")
    public ResponseEntity<List<CarResponse>> searchCars(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) Double priceMin,
            @RequestParam(required = false) Double priceMax,
            @RequestParam(required = false) Integer yearFrom,
            @RequestParam(required = false) Integer yearTo
    ) {
        List<CarResponse> cars = carService.searchCars(keyword, brand, category, color, priceMin, priceMax, yearFrom, yearTo);
        return ResponseEntity.ok(cars);
    }

    // ==================== 3. COMPARE ====================

    @Operation(summary = "So sánh xe", description = "Truyền vào danh sách ID xe để lấy thông tin so sánh")
    @GetMapping("/compare")
    public ResponseEntity<List<CarResponse>> compareCars(@RequestParam List<Long> ids) {
        // Tái sử dụng hàm getCar để tận dụng logic map ảnh/detail
        List<CarResponse> cars = ids.stream()
                .map(carService::getCar)
                .collect(Collectors.toList());
        return ResponseEntity.ok(cars);
    }

    // ==================== 4. CAR DETAILS (SPECIFIC OPERATIONS) ====================
    // Mặc dù đã có Unified Update ở trên, các API này vẫn giữ để update lẻ tẻ nếu cần

    @Operation(summary = "Lấy chi tiết kỹ thuật theo Car ID")
    @GetMapping("/{carId}/details")
    public ResponseEntity<ApiResponse<CarDetailResponse>> getCarDetailByCarId(@PathVariable("carId") Long carId) {
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết xe thành công!", carDetailService.getCarDetailByCarId(carId)));
    }

    @Operation(summary = "Cập nhật riêng chi tiết kỹ thuật (JSON)", description = "Dùng khi chỉ muốn sửa thông số kỹ thuật mà không upload ảnh hay đổi thông tin chung")
    @PutMapping("/details/{carDetailId}")
    public ResponseEntity<ApiResponse<Void>> updateCarDetail(
            @PathVariable("carDetailId") Long carDetailId,
            @RequestBody CarDetailRequest carDetailRequest) {
        carDetailService.updateCarDetail(carDetailId, carDetailRequest);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật chi tiết xe thành công!"));
    }

    // API Create/Delete Detail lẻ có thể ẩn đi hoặc hạn chế quyền admin vì logic giờ đã gộp vào Car
    // Nhưng vẫn giữ lại để tương thích code cũ nếu cần
    @Operation(summary = "Xoá chi tiết xe (Admin only)")
    @DeleteMapping("/details/{carDetailId}")
    public ResponseEntity<ApiResponse<Void>> deleteCarDetail(@PathVariable("carDetailId") Long carDetailId) {
        carDetailService.deleteCarDetail(carDetailId);
        return ResponseEntity.ok(ApiResponse.success("Xoá chi tiết xe thành công!"));
    }

    // ==================== 5. IMAGE RESOURCE ====================

    @Operation(summary = "Xem/Tải ảnh xe", description = "API trả về file ảnh trực tiếp để hiển thị trên thẻ <img>")
    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(CarService.UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = Files.probeContentType(filePath);
                if (contentType == null) contentType = "application/octet-stream";
                return ResponseEntity.ok().contentType(MediaType.parseMediaType(contentType)).body(resource);
            } else {
                throw new AppException(ErrorCode.FILE_NOT_FOUND);
            }
        } catch (MalformedURLException e) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }
}