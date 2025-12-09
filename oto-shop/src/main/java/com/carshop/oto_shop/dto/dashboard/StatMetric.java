package com.carshop.oto_shop.dto.dashboard;

public class StatMetric {
    private Object value; // Có thể là Long hoặc BigDecimal
    private double growthPercent; // % tăng trưởng so với tháng trước
    private boolean isUp; // Tăng hay giảm

    public StatMetric(Object value, double growthPercent) {
        this.value = value;
        this.growthPercent = Math.abs(growthPercent);
        this.isUp = growthPercent >= 0;
    }

    public Object getValue() {
        return value;
    }

    public void setValue(Object value) {
        this.value = value;
    }

    public double getGrowthPercent() {
        return growthPercent;
    }

    public void setGrowthPercent(double growthPercent) {
        this.growthPercent = growthPercent;
    }

    public boolean isUp() {
        return isUp;
    }

    public void setUp(boolean up) {
        isUp = up;
    }
}