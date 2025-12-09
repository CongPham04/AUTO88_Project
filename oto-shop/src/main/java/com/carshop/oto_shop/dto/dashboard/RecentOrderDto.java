package com.carshop.oto_shop.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RecentOrderDto {
    private String orderId;
    private String customerName;
    private String carModel;
    private LocalDateTime date;
    private String status;
    private BigDecimal total;

    public RecentOrderDto(String orderId, String customerName, String carModel, LocalDateTime date, String status, BigDecimal total) {
        this.orderId = orderId;
        this.customerName = customerName;
        this.carModel = carModel;
        this.date = date;
        this.status = status;
        this.total = total;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCarModel() {
        return carModel;
    }

    public void setCarModel(String carModel) {
        this.carModel = carModel;
    }

    public LocalDateTime getDate() {
        return date;
    }

    public void setDate(LocalDateTime date) {
        this.date = date;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }
}