package com.carshop.oto_shop.controllers;

import com.carshop.oto_shop.dto.dashboard.DashboardResponse;
import com.carshop.oto_shop.services.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/stats")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/overview")
    public ResponseEntity<DashboardResponse> getOverviewStats() {
        // Gọi Service xử lý toàn bộ logic tổng hợp dữ liệu
        DashboardResponse response = adminDashboardService.getDashboardOverview();
        return ResponseEntity.ok(response);
    }
}