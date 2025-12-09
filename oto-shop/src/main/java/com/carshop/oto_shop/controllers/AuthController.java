package com.carshop.oto_shop.controllers;

import com.carshop.oto_shop.common.response.ApiResponse;
import com.carshop.oto_shop.dto.auth.*;
import com.carshop.oto_shop.services.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "AuthController", description = "Quản lý xác thực, đăng ký và khôi phục mật khẩu")
public class AuthController {
    private final AuthService authService;

    // Thời gian sống của Refresh Token Cookie (7 ngày tính bằng giây)
    private static final long REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ================== LOGIN ==================
    @Operation(summary = "Login", description = "Đăng nhập bằng Email và Password. Trả về AccessToken trong Body và RefreshToken trong HttpOnly Cookie.")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwt = authService.login(loginRequest);

        // Tạo Cookie chứa Refresh Token
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", jwt.getRefreshToken())
                .httpOnly(true)
                .secure(false) // ⚠️ Quan trọng: Đổi thành TRUE khi chạy HTTPS (Production)
                .path("/api/auth/refresh") // Cookie chỉ được gửi khi gọi endpoint này
                .maxAge(REFRESH_TOKEN_EXPIRY)
                .sameSite("Strict")
                .build();

        // Chỉ trả accessToken cho client (body), refreshToken nằm ẩn trong cookie
        JwtResponse responseBody = new JwtResponse(jwt.getToken(), null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Đăng nhập thành công!", responseBody));
    }

    // ================== REFRESH TOKEN ==================
    @Operation(summary = "Refresh Token", description = "Lấy AccessToken mới bằng cách sử dụng RefreshToken từ Cookie.")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<JwtResponse>> refresh(@CookieValue(value = "refreshToken", required = false) String refreshToken) {
        // Gọi service để lấy token mới (chỉ trả về accessToken mới)
        JwtResponse jwt = authService.refreshToken(refreshToken);

        // (Tùy chọn) Gia hạn thời gian sống của Cookie Refresh Token
        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(REFRESH_TOKEN_EXPIRY)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(ApiResponse.success("Làm mới token thành công!", jwt));
    }

    // ================== REGISTER ==================
    @Operation(summary = "Signup", description = "Đăng ký tài khoản mới bằng Email.")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody SignupRequest signupRequest) {
        authService.register(signupRequest);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công! Vui lòng đăng nhập."));
    }

    // ================== LOGOUT ==================
    @Operation(summary = "Logout", description = "Đăng xuất: Xóa Cookie RefreshToken.")
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        ResponseCookie clearCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth/refresh")
                .maxAge(0) // Xóa ngay lập tức
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, clearCookie.toString())
                .body(ApiResponse.success("Đăng xuất thành công!"));
    }

    // ================== FORGOT PASSWORD (MỚI) ==================
    @Operation(summary = "Forgot Password", description = "Gửi yêu cầu quên mật khẩu. Hệ thống sẽ gửi link/token reset về Email.")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Yêu cầu đã được tiếp nhận. Vui lòng kiểm tra email để hướng dẫn đặt lại mật khẩu."));
    }

    // ================== RESET PASSWORD (MỚI) ==================
    @Operation(summary = "Reset Password", description = "Đặt lại mật khẩu mới bằng Token đã nhận qua Email.")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới."));
    }

    @Operation(summary = "Verify Account", description = "Kích hoạt tài khoản bằng mã OTP gửi về email")
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Void>> verifyAccount(@Valid @RequestBody VerifyRequest request) {
        authService.verifyAccount(request);
        return ResponseEntity.ok(ApiResponse.success("Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay."));
    }

    @Operation(summary = "Resend OTP", description = "Gửi lại mã xác thực mới vào email nếu mã cũ hết hạn hoặc bị mất")
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendVerificationCode(request);
        return ResponseEntity.ok(ApiResponse.success("Mã xác thực mới đã được gửi tới email của bạn."));
    }
}