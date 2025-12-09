package com.carshop.oto_shop.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class DashboardResponse {
    private DashboardStats stats;
    private List<RevenueChartData> revenueChart;
    private List<OrderStatusData> orderStatusChart;
    private List<RecentOrderDto> recentOrders;
    private List<LowStockCarDto> lowStockCars;

    // Getters and Setters
    public DashboardStats getStats() { return stats; }
    public void setStats(DashboardStats stats) { this.stats = stats; }
    public List<RevenueChartData> getRevenueChart() { return revenueChart; }
    public void setRevenueChart(List<RevenueChartData> revenueChart) { this.revenueChart = revenueChart; }
    public List<OrderStatusData> getOrderStatusChart() { return orderStatusChart; }
    public void setOrderStatusChart(List<OrderStatusData> orderStatusChart) { this.orderStatusChart = orderStatusChart; }
    public List<RecentOrderDto> getRecentOrders() { return recentOrders; }
    public void setRecentOrders(List<RecentOrderDto> recentOrders) { this.recentOrders = recentOrders; }
    public List<LowStockCarDto> getLowStockCars() { return lowStockCars; }
    public void setLowStockCars(List<LowStockCarDto> lowStockCars) { this.lowStockCars = lowStockCars; }
}