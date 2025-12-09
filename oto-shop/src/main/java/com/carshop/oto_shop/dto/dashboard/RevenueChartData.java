package com.carshop.oto_shop.dto.dashboard;

import java.math.BigDecimal;

public class RevenueChartData {
    private String month; // Ví dụ: "Tháng 1"
    private BigDecimal revenue; // Doanh thu (tỷ/triệu)

    public RevenueChartData(String month, BigDecimal revenue) {
        this.month = month;
        this.revenue = revenue;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getRevenue() {
        return revenue;
    }

    public void setRevenue(BigDecimal revenue) {
        this.revenue = revenue;
    }
}