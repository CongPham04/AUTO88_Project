package com.carshop.oto_shop.services;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.BadRequestException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.dto.car.CarRequest;
import com.carshop.oto_shop.dto.car.CarResponse;
import com.carshop.oto_shop.entities.Car;
import com.carshop.oto_shop.entities.CarDetail;
import com.carshop.oto_shop.entities.CarImage;
import com.carshop.oto_shop.enums.Brand;
import com.carshop.oto_shop.enums.Category;
import com.carshop.oto_shop.enums.Color;
import com.carshop.oto_shop.mappers.CarDetailMapper;
import com.carshop.oto_shop.mappers.CarMapper;
import com.carshop.oto_shop.repositories.CarRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class CarService {
    private static final Logger logger = LoggerFactory.getLogger(CarService.class);

    private final CarRepository carRepository;
    private final CarMapper carMapper;
    private final CarDetailMapper carDetailMapper;

    // Đường dẫn lưu file
    public static final String UPLOAD_DIR = "uploads/cars/";

    public CarService(CarRepository carRepository, CarMapper carMapper, CarDetailMapper carDetailMapper) {
        this.carRepository = carRepository;
        this.carMapper = carMapper;
        this.carDetailMapper = carDetailMapper;
    }

    // ================== CREATE ==================
    @Transactional
    public void createCar(CarRequest carRequest) {
        try {
            // 1. Map thông tin cơ bản (Brand, Model, Quantity, Colors...)
            // Lưu ý: Mapper cần được cấu hình để ignore 'images' và 'carDetail' để xử lý thủ công bên dưới
            Car car = carMapper.toCar(carRequest);

            // 2. Logic Tồn kho (Khởi tạo)
            if (car.getQuantity() == null) car.setQuantity(0);
            car.setSoldQuantity(0); // Mới tạo chưa bán được xe nào
            car.updateStatusBasedOnQuantity(); // Cập nhật status (AVAILABLE/SOLD)

            // 3. Xử lý Chi tiết xe (Unified Creation)
            // Vì dùng CascadeType.ALL ở Entity Car, ta chỉ cần set quan hệ, không cần gọi detailRepo.save()
            if (carRequest.getDetail() != null) {
                CarDetail detail = carDetailMapper.toCarDetail(carRequest.getDetail());
                car.setCarDetailInfo(detail); // Helper method trong Entity set quan hệ 2 chiều
            }

            // 4. Xử lý Nhiều ảnh (Multiple Images)
            if (carRequest.getImageFiles() != null && !carRequest.getImageFiles().isEmpty()) {
                for (MultipartFile file : carRequest.getImageFiles()) {
                    String imagePath = saveImage(file);
                    CarImage carImage = new CarImage(imagePath, car);
                    car.addImage(carImage); // Helper method trong Entity set quan hệ 2 chiều
                }
            }

            // 5. Lưu tất cả (Cascade sẽ lưu Detail, Images, Colors)
            logger.info("Creating car: {}, Qty: {}, Colors: {}", car.getModel(), car.getQuantity(), car.getColors());
            carRepository.save(car);

        } catch (DataIntegrityViolationException ex) {
            handleDbException(ex);
        }
    }

    // ================== UPDATE ==================
    @Transactional
    public void updateCar(CarRequest carRequest, Long carId) {
        try {
            Car car = carRepository.findById(carId)
                    .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

            // 1. Update thông tin cơ bản (Model, Price, Description, Brand, Category, Colors...)
            carMapper.updateCarRequest(carRequest, car);

            // 2. Update Logic Tồn kho
            // Nếu request có gửi quantity mới, status sẽ được cập nhật
            car.updateStatusBasedOnQuantity();

            // 3. Update Chi tiết xe (Unified Update)
            if (carRequest.getDetail() != null) {
                if (car.getCarDetail() == null) {
                    // Nếu chưa có detail -> Tạo mới
                    CarDetail newDetail = carDetailMapper.toCarDetail(carRequest.getDetail());
                    car.setCarDetailInfo(newDetail);
                } else {
                    // Nếu đã có -> Update đè lên
                    carDetailMapper.updateCarDetail(carRequest.getDetail(), car.getCarDetail());
                }
            }

            // 4. Update Ảnh (Append Mode - Thêm ảnh mới vào danh sách cũ)
            // (Nếu muốn logic xoá ảnh cũ thay thế hoàn toàn, cần clear list images và xoá file vật lý trước)
            if (carRequest.getImageFiles() != null && !carRequest.getImageFiles().isEmpty()) {
                for (MultipartFile file : carRequest.getImageFiles()) {
                    String imagePath = saveImage(file);
                    CarImage carImage = new CarImage(imagePath, car);
                    car.addImage(carImage);
                }
            }

            carRepository.save(car); // Cascade update

        } catch (DataIntegrityViolationException ex) {
            handleDbException(ex);
        }
    }

    // ================== DELETE ==================
    @Transactional
    public void deleteCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // 1. Xoá file ảnh vật lý trên ổ cứng trước
        if (car.getImages() != null) {
            for (CarImage img : car.getImages()) {
                deleteImageFile(img.getImageUrl());
            }
        }

        // 2. Xoá dữ liệu trong DB
        // Do CascadeType.ALL, việc xoá Car sẽ tự động xoá CarDetail, CarImages và CarColors
        carRepository.delete(car);
        logger.info("Deleted car id: {}", carId);
    }

    // ================== GET & SEARCH ==================
    @Transactional
    public CarResponse getCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new AppException(ErrorCode.CAR_NOT_FOUND));

        // Mapper toCarResponse cần được cấu hình để map List<CarImage> thành List<String> URL
        return carMapper.toCarResponse(car);
    }

    @Transactional
    public List<CarResponse> getAllCars() {
        return carRepository.findAll().stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    @Transactional
    public List<CarResponse> getCarsByBrand(Brand brand) {
        return carRepository.findAllByBrand(brand).stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    @Transactional
    public List<CarResponse> getCarsByCategory(Category category) {
        return carRepository.findAllByCategory(category).stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    @Transactional
    public List<CarResponse> searchCars(String keyword, String brand, String category,
                                        String color, Double priceMin, Double priceMax,
                                        Integer yearFrom, Integer yearTo) {

        Specification<Car> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Tìm kiếm keyword (Model, Brand, Category, "Brand Model")
            if (keyword != null && !keyword.isEmpty()) {
                String keywordLower = "%" + keyword.toLowerCase().replaceAll("\\s+", " ") + "%";
                String keywordSpaced = "%" + keyword.toLowerCase().replaceAll("\\s+", "%") + "%";

                Predicate modelLike = cb.like(cb.lower(root.get("model")), keywordSpaced);
                Predicate brandLike = cb.like(cb.lower(root.get("brand").as(String.class)), keywordSpaced);
                Predicate categoryLike = cb.like(cb.lower(root.get("category").as(String.class)), keywordSpaced);

                Predicate brandAndModelLike = cb.like(
                        cb.lower(cb.concat(cb.concat(root.get("brand").as(String.class), " "), root.get("model"))),
                        keywordLower
                );
                predicates.add(cb.or(modelLike, brandLike, categoryLike, brandAndModelLike));
            }

            // 2. Filter chính xác
            if (brand != null && !brand.isEmpty()) {
                predicates.add(cb.equal(root.get("brand"), Brand.valueOf(brand.toUpperCase())));
            }
            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), Category.valueOf(category.toUpperCase())));
            }

            // 3. Filter Màu sắc (Xử lý ElementCollection)
            // Logic: Kiểm tra xem màu tìm kiếm có nằm trong danh sách màu của xe không
            if (color != null && !color.isEmpty()) {
                try {
                    Color colorEnum = Color.valueOf(color.toUpperCase());
                    // Sử dụng cb.isMember cho Collection
                    predicates.add(cb.isMember(colorEnum, root.get("colors")));
                } catch (IllegalArgumentException e) {
                    logger.warn("Invalid color search: {}", color);
                }
            }

            // 4. Filter Giá
            if (priceMin != null) predicates.add(cb.greaterThanOrEqualTo(root.get("price"), priceMin));
            if (priceMax != null) predicates.add(cb.lessThanOrEqualTo(root.get("price"), priceMax));

            // 5. Filter Năm
            if (yearFrom != null) predicates.add(cb.equal(root.get("manufactureYear"), yearFrom));
            if (yearTo != null) predicates.add(cb.lessThanOrEqualTo(root.get("manufactureYear"), yearTo));

            // [Mới] Mặc định chỉ hiển thị xe có status AVAILABLE nếu không phải Admin?
            // (Tuỳ chọn logic nghiệp vụ, ở đây tạm thời lấy hết)

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return carRepository.findAll(spec).stream()
                .map(carMapper::toCarResponse)
                .toList();
    }

    // ================== UTILS ==================

    private String saveImage(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null ||
                    (!contentType.equals("image/png")
                            && !contentType.equals("image/jpeg")
                            && !contentType.equals("image/jpg")
                            && !contentType.equals("image/webp"))) {
                throw new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
            }
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs(); // mkdirs tạo cả thư mục cha nếu thiếu
            }

            // Tên file unique
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path path = Paths.get(UPLOAD_DIR + fileName);

            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return UPLOAD_DIR + fileName; // Lưu đường dẫn tương đối
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }

    private void deleteImageFile(String imagePath) {
        if (imagePath == null) return;
        try {
            // imagePath trong DB dạng: "uploads/cars/123_abc.jpg"
            Path filePath = Paths.get(imagePath).normalize();
            File file = filePath.toFile();
            if (file.exists()) {
                if(file.delete()) {
                    logger.info("Deleted file: {}", imagePath);
                } else {
                    logger.warn("Failed to delete file: {}", imagePath);
                }
            }
        } catch (Exception e) {
            logger.error("Error deleting file {}: {}", imagePath, e.getMessage());
        }
    }

    private void handleDbException(DataIntegrityViolationException ex) {
        String message = ex.getMostSpecificCause().getMessage();
        if (message != null && message.contains("cannot be null")) {
            String field = message.substring(message.indexOf("'") + 1, message.lastIndexOf("'"));
            throw new BadRequestException(field + " không được để trống!");
        } else if (message != null && message.contains("Duplicate entry")) {
            throw new BadRequestException("Dữ liệu đã tồn tại (trùng lặp)!");
        } else {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}