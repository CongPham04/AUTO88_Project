package com.carshop.oto_shop.dto.car;

import com.carshop.oto_shop.dto.cardetail.CarDetailRequest;
import com.carshop.oto_shop.enums.Brand;
import com.carshop.oto_shop.enums.CarStatus;
import com.carshop.oto_shop.enums.Category;
import com.carshop.oto_shop.enums.Color;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public class CarRequest {
    @NotNull(message = "Brand không được để trống")
    private Brand brand;

    @NotNull(message = "Category không được để trống")
    private Category category;

    private String model;
    private Integer manufactureYear;
    private BigDecimal price;
    private String description;

    // 1. Tồn kho
    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0")
    private Integer quantity = 1;

    // 2. Nhiều màu sắc (List enum)
    private Set<Color> colors;

    // 3. Nhiều ảnh (List files)
    private List<MultipartFile> imageFiles;

    // 4. Lồng ghép chi tiết xe (Để tạo cùng lúc)
    @Valid // Validate các trường bên trong detail
    private CarDetailRequest detail;

    public CarRequest() {
    }

    public CarRequest(Brand brand, Category category, String model, Integer manufactureYear, BigDecimal price, String description, Integer quantity, Set<Color> colors, List<MultipartFile> imageFiles, CarDetailRequest detail) {
        this.brand = brand;
        this.category = category;
        this.model = model;
        this.manufactureYear = manufactureYear;
        this.price = price;
        this.description = description;
        this.quantity = quantity;
        this.colors = colors;
        this.imageFiles = imageFiles;
        this.detail = detail;
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

    public Set<Color> getColors() {
        return colors;
    }

    public void setColors(Set<Color> colors) {
        this.colors = colors;
    }

    public List<MultipartFile> getImageFiles() {
        return imageFiles;
    }

    public void setImageFiles(List<MultipartFile> imageFiles) {
        this.imageFiles = imageFiles;
    }

    public CarDetailRequest getDetail() {
        return detail;
    }

    public void setDetail(CarDetailRequest detail) {
        this.detail = detail;
    }

    // GIẢI PHÁP TỐT NHẤT NẾU MUỐN GỬI JSON STRING:
    // Thêm setter nhận String để Spring fallback vào nếu nhận được String
    public void setDetail(String detailJson) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            this.detail = mapper.readValue(detailJson, CarDetailRequest.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Dữ liệu chi tiết xe (JSON) không hợp lệ");
        }
    }
}
