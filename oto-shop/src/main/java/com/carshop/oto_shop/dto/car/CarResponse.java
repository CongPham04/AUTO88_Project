package com.carshop.oto_shop.dto.car;

import com.carshop.oto_shop.dto.cardetail.CarDetailResponse;
import com.carshop.oto_shop.enums.Brand;
import com.carshop.oto_shop.enums.CarStatus;
import com.carshop.oto_shop.enums.Category;
import com.carshop.oto_shop.enums.Color;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public class CarResponse {
    private Long carId;

    private Brand brand;

    private Category category;

    private String model;

    private Integer manufactureYear;

    private BigDecimal price;

    private String description;
    private Integer quantity;
    private Integer soldQuantity;
    private Set<Color> colors;
    // ✅ Đã bổ sung trường status
    private CarStatus status;
    private List<String> imageUrls; // Trả về list link ảnh
    private CarDetailResponse detail; // Trả về luôn chi tiết xe

    public CarResponse() {}

    public CarResponse(Long carId, Brand brand, Category category, String model, Integer manufactureYear, BigDecimal price, String description, Integer quantity, Integer soldQuantity, Set<Color> colors, CarStatus status, List<String> imageUrls, CarDetailResponse detail) {
        this.carId = carId;
        this.brand = brand;
        this.category = category;
        this.model = model;
        this.manufactureYear = manufactureYear;
        this.price = price;
        this.description = description;
        this.quantity = quantity;
        this.soldQuantity = soldQuantity;
        this.colors = colors;
        this.status = status;
        this.imageUrls = imageUrls;
        this.detail = detail;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public Brand getBrand() {
        return brand;
    }

    public void setBrand(Brand brand) {
        this.brand = brand;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
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

    public Set<Color> getColors() {
        return colors;
    }

    public void setColors(Set<Color> colors) {
        this.colors = colors;
    }

    public CarStatus getStatus() {
        return status;
    }

    public void setStatus(CarStatus status) {
        this.status = status;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public CarDetailResponse getDetail() {
        return detail;
    }

    public void setDetail(CarDetailResponse detail) {
        this.detail = detail;
    }
}
