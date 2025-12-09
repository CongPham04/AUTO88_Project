package com.carshop.oto_shop.dto.dashboard;

public class DashboardStats {
    private StatMetric totalCars;     // Tổng xe trong kho
    private StatMetric monthlyOrders; // Đơn hàng tháng này
    private StatMetric newCustomers;  // Khách hàng mới
    private StatMetric monthlyRevenue;// Doanh thu tháng

    public DashboardStats() {
    }

    public StatMetric getTotalCars() {
        return totalCars;
    }

    public void setTotalCars(StatMetric totalCars) {
        this.totalCars = totalCars;
    }

    public StatMetric getMonthlyOrders() {
        return monthlyOrders;
    }

    public void setMonthlyOrders(StatMetric monthlyOrders) {
        this.monthlyOrders = monthlyOrders;
    }

    public StatMetric getNewCustomers() {
        return newCustomers;
    }

    public void setNewCustomers(StatMetric newCustomers) {
        this.newCustomers = newCustomers;
    }

    public StatMetric getMonthlyRevenue() {
        return monthlyRevenue;
    }

    public void setMonthlyRevenue(StatMetric monthlyRevenue) {
        this.monthlyRevenue = monthlyRevenue;
    }
}