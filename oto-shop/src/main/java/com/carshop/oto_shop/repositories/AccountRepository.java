package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.Account;
import com.carshop.oto_shop.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, String> {
    boolean existsByEmail(String email);
    Optional<Account> findByEmail(String email);
    boolean existsById(String accountId);
    // ✅ THÊM MỚI: Tìm tài khoản dựa trên mã OTP
    Optional<Account> findByVerificationCode(String verificationCode);
    // --- DASHBOARD QUERIES ---

    // 1. Đếm số tài khoản theo Role và ngày tạo (Dùng cho Card "Khách hàng mới")
    long countByRoleAndCreateAtBetween(Role role, LocalDateTime start, LocalDateTime end);
}
