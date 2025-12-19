package com.carshop.oto_shop.entities;

import com.carshop.oto_shop.enums.Brand;
import com.carshop.oto_shop.enums.CarStatus;
import com.carshop.oto_shop.enums.Category;
import com.carshop.oto_shop.enums.Color;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.*;

@Entity
@Table(name = "cars")
public class Car {
    @Id
    @Column(name = "car_id", nullable = false, updatable = false)
    private Long carId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "brand", nullable = false, length = 20)
    private Brand brand;

    @Column(name = "model", nullable = false, length = 50)
    private String model;

    @Column(name = "manufacture_year", nullable = false)
    private Integer manufactureYear;

    @Column(name = "price", nullable = false, precision = 15, scale = 3)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "color", length = 30)
    private Color color;

    @Column(name = "description")
    private String description;

    // --- 1. LOGIC TỒN KHO ---
    @Column(name = "quantity", nullable = false)
    private Integer quantity = 0; // Số lượng tồn

    @Column(name = "sold_quantity", nullable = false)
    private Integer soldQuantity = 0; // Số lượng đã bán

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private CarStatus status;

    // --- 2. LOGIC NHIỀU MÀU SẮC ---
    // Tạo bảng phụ car_colors lưu danh sách màu
    @ElementCollection(targetClass = Color.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "car_colors", joinColumns = @JoinColumn(name = "car_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "color")
    private Set<Color> colors = new HashSet<>();

    // --- 3. QUAN HỆ VỚI ẢNH (1-N) ---
    // Xoá cột imageUrl cũ đi, dùng list này thay thế
    @OneToMany(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CarImage> images = new ArrayList<>();

    // --- 4. QUAN HỆ VỚI CHI TIẾT XE (1-1 Bidirectional) ---
    // mappedBy trỏ tới biến 'car' trong class CarDetail
    @OneToOne(mappedBy = "car", cascade = CascadeType.ALL, orphanRemoval = true)
    private CarDetail carDetail;

    // Thêm 2 field mới
    @Column(name = "avg_rating", columnDefinition = "DOUBLE(3, 2)")
    private Double avgRating = 0.0;

    @Column(name = "review_count", nullable = false)
    private Integer reviewCount = 0;

    @PrePersist
    public void generateAuto() {
        if (this.carId == null) {
            this.carId = 100000L + new Random().nextLong(900000);
        }
        updateStatusBasedOnQuantity();
    }

    @PreUpdate
    public void updateStatusBasedOnQuantity() {
        if (this.quantity != null && this.quantity <= 0) {
            this.status = CarStatus.SOLD; // Hoặc thêm ENUM: OUT_OF_STOCK
        } else {
            this.status = CarStatus.AVAILABLE;
        }
    }

    // Helper method để thêm ảnh dễ dàng
    public void addImage(CarImage image) {
        images.add(image);
        image.setCar(this);
    }

    // Helper method để set detail (quan trọng cho Cascade)
    public void setCarDetailInfo(CarDetail carDetail) {
        this.carDetail = carDetail;
        if (carDetail != null) {
            carDetail.setCar(this);
        }
    }

    public Car() {
    }

    // Thêm getters/setters cho 2 field mới này
    public Double getAvgRating() {
        return avgRating;
    }

    public void setAvgRating(Double avgRating) {
        this.avgRating = avgRating;
    }

    public Integer getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(Integer reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getManufactureYear() {
        return manufactureYear;
    }

    public void setManufactureYear(Integer manufactureYear) {
        this.manufactureYear = manufactureYear;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Color getColor() {
        return color;
    }

    public void setColor(Color color) {
        this.color = color;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getSoldQuantity() {
        return soldQuantity;
    }

    public void setSoldQuantity(Integer soldQuantity) {
        this.soldQuantity = soldQuantity;
    }

    public CarStatus getStatus() {
        return status;
    }

    public void setStatus(CarStatus status) {
        this.status = status;
    }

    public Set<Color> getColors() {
        return colors;
    }

    public void setColors(Set<Color> colors) {
        this.colors = colors;
    }

    public List<CarImage> getImages() {
        return images;
    }

    public void setImages(List<CarImage> images) {
        this.images = images;
    }

    public CarDetail getCarDetail() {
        return carDetail;
    }

    public void setCarDetail(CarDetail carDetail) {
        this.carDetail = carDetail;
    }
}