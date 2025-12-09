package com.carshop.oto_shop.dto.dashboard;

public class LowStockCarDto {
    private Long carId;
    private String model;
    private Integer stock;

    public LowStockCarDto(Long carId, String model, Integer stock) {
        this.carId = carId;
        this.model = model;
        this.stock = stock;
    }

    public Long getCarId() {
        return carId;
    }

    public void setCarId(Long carId) {
        this.carId = carId;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}