package com.carshop.oto_shop.entities;

import com.carshop.oto_shop.enums.AccountStatus;
import com.carshop.oto_shop.enums.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "accounts",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_accounts_email", columnNames = "email")
        }
)
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "account_id", length = 36, nullable = false, updatable = false)
    private String accountId;

    // Đã xóa field username

    @Column(name = "email", length = 100, unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 10)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 10)
    private AccountStatus status;

    @Column(name = "create_at", nullable = false)
    private LocalDateTime createAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Thêm 2 field mới này
    @Column(name = "reset_attempts", nullable = false)
    private int resetAttempts = 0;

    @Column(name = "last_reset_attempt")
    private LocalDateTime lastResetAttempt;

    // Thêm field này để lưu mã OTP kích hoạt (VD: 6 số)
    @Column(name = "verification_code", length = 10)
    private String verificationCode;

    // THÊM FIELD NÀY
    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

    public Account() {}

    // Getters and Setters (Nhớ xóa getter/setter của username)
    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public AccountStatus getStatus() { return status; }
    public void setStatus(AccountStatus status) { this.status = status; }

    public LocalDateTime getCreateAt() { return createAt; }
    public void setCreateAt(LocalDateTime createAt) { this.createAt = createAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public int getResetAttempts() {
        return resetAttempts;
    }

    public void setResetAttempts(int resetAttempts) {
        this.resetAttempts = resetAttempts;
    }

    public LocalDateTime getLastResetAttempt() {
        return lastResetAttempt;
    }

    public void setLastResetAttempt(LocalDateTime lastResetAttempt) {
        this.lastResetAttempt = lastResetAttempt;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public LocalDateTime getVerificationCodeExpiresAt() {
        return verificationCodeExpiresAt;
    }

    public void setVerificationCodeExpiresAt(LocalDateTime verificationCodeExpiresAt) {
        this.verificationCodeExpiresAt = verificationCodeExpiresAt;
    }

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        this.createAt = now;
        this.updatedAt = now;
        if(this.role == null) this.role = Role.USER;
        if(this.status == null) this.status = AccountStatus.ACTIVE;
        // QUAN TRỌNG: Mặc định là INACTIVE khi mới tạo
        if(this.status == null) this.status = AccountStatus.INACTIVE;
        // Mặc định attempts = 0
        this.resetAttempts = 0;
    }

    @PreUpdate
    public void preUpdate(){
        this.updatedAt = LocalDateTime.now();
    }
}