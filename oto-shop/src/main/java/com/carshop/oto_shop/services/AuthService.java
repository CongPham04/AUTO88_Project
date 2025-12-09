package com.carshop.oto_shop.services;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.DuplicateKeyException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.dto.auth.JwtResponse;
import com.carshop.oto_shop.dto.auth.LoginRequest;
import com.carshop.oto_shop.dto.auth.SignupRequest;
import com.carshop.oto_shop.dto.auth.VerifyRequest;
import com.carshop.oto_shop.dto.auth.ResendOtpRequest;
import com.carshop.oto_shop.entities.Account;
import com.carshop.oto_shop.entities.PasswordResetToken;
import com.carshop.oto_shop.entities.User;
import com.carshop.oto_shop.enums.AccountStatus;
import com.carshop.oto_shop.repositories.AccountRepository;
import com.carshop.oto_shop.repositories.PasswordResetTokenRepository;
import com.carshop.oto_shop.repositories.UserRepository;
import com.carshop.oto_shop.security.jwt.JwtTokenProvider;
import com.carshop.oto_shop.security.models.CustomUserDetails;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

@Service
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;

    // Lấy URL frontend từ file cấu hình (mặc định là http://localhost:3000 nếu không tìm thấy)
    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    public AuthService(AccountRepository accountRepository,
                       UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       EmailService emailService) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.emailService = emailService;
    }

    // === CẬP NHẬT LOGIC LOGIN TẠI ĐÂY ===
    public JwtResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

            // ✅ BỔ SUNG: Chặn nếu trạng thái là DELETED
            if (userDetails.getStatus() == AccountStatus.DELETED) {
                // Bạn có thể dùng ACCOUNT_BANNED hoặc tạo một mã lỗi mới ACCOUNT_DELETED
                throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND, "Tài khoản này đã bị xóa.");
            }
            // Kiểm tra thêm ở đây cho chắc chắn (dù DisabledException đã bắt rồi)
            if (userDetails.getStatus() == AccountStatus.INACTIVE) {
                throw new AppException(ErrorCode.ACCOUNT_NOT_VERIFIED);
            }
            String email = userDetails.getUsername();
            String role = userDetails.getRole();
            String accessToken = jwtTokenProvider.generateToken(email, role);
            String refreshToken = jwtTokenProvider.generateRefreshToken(email, role);

            // ========================================================================
            // ✅ THÊM MỚI: GỬI EMAIL THÔNG BÁO ĐĂNG NHẬP THÀNH CÔNG
            // ========================================================================
            try {
                // Lấy thời gian hiện tại format đẹp
                String loginTime = LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss ngày dd/MM/yyyy"));

                String subject = "Thông báo đăng nhập mới - Auto 88";
                String content = """
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                        <h2 style="color: #2e7d32; text-align: center;">Đăng nhập thành công</h2>
                        <p>Xin chào,</p>
                        <p>Tài khoản Auto 88 của bạn (<b>%s</b>) vừa được đăng nhập thành công.</p>
                        
                        <div style="background-color: #f1f8e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #2e7d32;">
                            <p style="margin: 5px 0;"><b>Thời gian:</b> %s</p>
                            <p style="margin: 5px 0;"><b>Trạng thái:</b> Thành công</p>
                        </div>
                        
                        <p style="color: #d32f2f; font-style: italic;">
                            ⚠️ Nếu đây không phải là bạn, vui lòng đổi mật khẩu ngay lập tức để bảo vệ tài khoản.
                        </p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #777; font-size: 12px; text-align: center;">Trân trọng,<br>Đội ngũ Auto 88</p>
                    </div>
                    """.formatted(email, loginTime);

                // Gửi mail (Nên đảm bảo hàm này chạy Async để không làm chậm quá trình login)
                emailService.sendHtmlEmail(email, subject, content);

            } catch (Exception e) {
                // Quan trọng: Lỗi gửi mail KHÔNG được làm fail việc đăng nhập
                logger.error("Lỗi gửi mail cảnh báo đăng nhập: {}", e.getMessage());
            }
            // ========================================================================

            return new JwtResponse(accessToken, refreshToken);

        } catch (BadCredentialsException e) {
            throw new AppException(ErrorCode.LOGIN_FAILED);
        } catch (DisabledException e) {
            // ⚠️ SỬA ĐỔI TẠI ĐÂY:
            // Spring Security ném DisabledException khi isEnabled() = false.
            // Điều này xảy ra cho cả INACTIVE và DELETED.
            // Ta cần query DB để biết chính xác là trạng thái nào.

            Account account = accountRepository.findByEmail(request.getEmail()).orElse(null);

            if (account != null && account.getStatus() == AccountStatus.DELETED) {
                throw new AppException(ErrorCode.ACCOUNT_DELETED);
            }

            // Nếu không phải DELETED thì là INACTIVE
            throw new AppException(ErrorCode.ACCOUNT_NOT_VERIFIED);
        } catch (LockedException e) {
            throw new AppException(ErrorCode.ACCOUNT_BANNED);
        }
    }

    public JwtResponse refreshToken(String refreshToken) {
        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            throw new AppException(ErrorCode.INVALID_OR_EXPIRED_REFRESH_TOKEN);
        }
        String email = jwtTokenProvider.getEmailFromToken(refreshToken);
        String role = jwtTokenProvider.getRoleFromToken(refreshToken);
        String newAccessToken = jwtTokenProvider.generateToken(email, role);
        return new JwtResponse(newAccessToken, null);
    }

    // 2. REGISTER: Tạo tài khoản INACTIVE và gửi OTP
    @Transactional
    public void register(SignupRequest request) {
        // 1. Tìm xem email đã có trong DB chưa
        Optional<Account> existingAccountOpt = accountRepository.findByEmail(request.getEmail());

        if (existingAccountOpt.isPresent()) {
            Account existingAccount = existingAccountOpt.get();

            // 2. Kiểm tra trạng thái
            if (existingAccount.getStatus() == AccountStatus.DELETED) {
                // Trường hợp đã xóa mềm -> Trả về message riêng
                throw new AppException(ErrorCode.BAD_REQUEST, "Email này đã xoá khỏi hệ thống và không được phép đăng ký lại.");
            } else {
                // Trường hợp ACTIVE, INACTIVE, BANNED -> Trả về lỗi trùng lặp thông thường
                throw new AppException(ErrorCode.DUPLICATE_KEY, "Email đã tồn tại!");
            }
        }

        try {
            Account account = new Account();
            account.setEmail(request.getEmail());
            account.setPassword(passwordEncoder.encode(request.getPassword()));
            account.setStatus(AccountStatus.INACTIVE);

            String otp = String.format("%06d", new Random().nextInt(999999));
            account.setVerificationCode(otp);

            // ✅ SỬA: Tăng thời gian hết hạn lên 5 phút
            account.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(5));

            Account savedAccount = accountRepository.save(account);

            User user = new User();
            user.setAccount(savedAccount);
            user.setFullName(request.getFullName());
            userRepository.save(user);

            // === CẬP NHẬT TEXT GỬI MAIL (HTML) ===
            String subject = "Xác thực tài khoản - Auto 88";
            String content = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #d32f2f; text-align: center;">Chào mừng đến với Auto 88!</h2>
                    <p>Xin chào <b>%s</b>,</p>
                    <p>Cảm ơn bạn đã đăng ký tài khoản. Để hoàn tất quá trình đăng ký, vui lòng nhập mã xác thực (OTP) dưới đây:</p>
                    
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">%s</span>
                    </div>
                    
                    <p>Mã này sẽ hết hạn trong vòng <strong>5 phút</strong>.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #777; font-size: 12px; text-align: center;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
                    <p style="color: #777; font-size: 12px; text-align: center;">Trân trọng,<br>Đội ngũ Auto 88</p>
                </div>
                """.formatted(request.getFullName(), otp);

            // Dùng sendHtmlEmail để hiển thị đẹp
            emailService.sendHtmlEmail(request.getEmail(), subject, content);

        } catch (Exception e) {
            logger.error("Lỗi gửi mail xác thực", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi gửi mã xác thực.");
        }
    }

    // 2. THÊM HÀM GỬI LẠI MÃ (RESEND OTP)
    @Transactional
    public void resendVerificationCode(ResendOtpRequest request) {
        Account account = accountRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        // Nếu đã kích hoạt rồi thì không gửi nữa
        if (account.getStatus() == AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_VERIFIED);
        }

        try {
            // Tạo mã OTP mới (Mã cũ sẽ bị ghi đè)
            String newOtp = String.format("%06d", new Random().nextInt(999999));
            account.setVerificationCode(newOtp);

            // ✅ Đặt lại thời gian hết hạn 5 phút kể từ bây giờ
            account.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(5));

            accountRepository.save(account);

            // === CẬP NHẬT TEXT GỬI MAIL (HTML) ===
            String subject = "Gửi lại mã xác thực - Auto 88";
            String content = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #1976d2; text-align: center;">Mã xác thực mới</h2>
                    <p>Xin chào,</p>
                    <p>Chúng tôi đã nhận được yêu cầu gửi lại mã xác thực cho tài khoản của bạn.</p>
                    
                    <div style="background-color: #e3f2fd; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0; border: 1px dashed #2196f3;">
                        <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #0d47a1;">%s</span>
                    </div>
                    
                    <p>Mã này có hiệu lực trong <strong>5 phút</strong>. Vui lòng bỏ qua các mã cũ trước đó.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #777; font-size: 12px; text-align: center;">Trân trọng,<br>Đội ngũ Auto 88</p>
                </div>
                """.formatted(newOtp);

            emailService.sendHtmlEmail(account.getEmail(), subject, content);

        } catch (Exception e) {
            logger.error("Lỗi gửi lại mã xác thực", e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể gửi lại mã. Vui lòng thử lại sau.");
        }
    }

    // 3. VERIFY: Hàm mới để kích hoạt tài khoản
    @Transactional
    public void verifyAccount(VerifyRequest request) {
        // Tìm tài khoản theo mã OTP
        Account account = accountRepository.findByVerificationCode(request.getCode())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_VERIFICATION_CODE));

        // Nếu đã kích hoạt rồi thì bỏ qua
        if (account.getStatus() == AccountStatus.ACTIVE) {
            return;
        }

        // ✅ 1. KIỂM TRA THỜI GIAN HẾT HẠN
        if (account.getVerificationCodeExpiresAt() != null &&
                LocalDateTime.now().isAfter(account.getVerificationCodeExpiresAt())) {

            // (Tùy chọn) Xóa OTP hết hạn để tránh tìm thấy lần sau, hoặc giữ lại để báo lỗi expired
            // Ở đây tôi ném lỗi ra luôn
            throw new AppException(ErrorCode.VERIFICATION_CODE_EXPIRED);
        }

        // 2. Kích hoạt tài khoản
        account.setStatus(AccountStatus.ACTIVE);

        // 3. Xóa mã OTP và thời gian hết hạn
        account.setVerificationCode(null);
        account.setVerificationCodeExpiresAt(null);

        accountRepository.save(account);
    }

    // 4. FORGOT PASSWORD: Chặn nếu chưa kích hoạt
    @Transactional
    public void forgotPassword(String email) {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        // ⚠️ QUAN TRỌNG: Chặn gửi mail reset nếu tài khoản là rác (chưa kích hoạt)
        // Điều này giải quyết triệt để vấn đề "Mail Delivery Subsystem" khi người dùng nhập sai email lúc đăng ký
        if (account.getStatus() == AccountStatus.INACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_VERIFIED, "Tài khoản này chưa được kích hoạt, không thể đặt lại mật khẩu.");
        }

        // ... (Logic Rate Limit giữ nguyên) ...
        if (account.getLastResetAttempt() != null) {
            long hours = Duration.between(account.getLastResetAttempt(), LocalDateTime.now()).toHours();
            if (hours >= 24) account.setResetAttempts(0);
        }
        if (account.getResetAttempts() >= 3) {
            throw new AppException(ErrorCode.PASSWORD_RESET_LIMIT_EXCEEDED);
        }

        try {
            passwordResetTokenRepository.deleteByAccount(account);
            passwordResetTokenRepository.flush();

            String token = UUID.randomUUID().toString();
            PasswordResetToken resetToken = new PasswordResetToken(token, account);
            passwordResetTokenRepository.save(resetToken);

            String resetLink = frontendUrl + "/auth?token=" + token;

            // === CẬP NHẬT TEXT GỬI MAIL (HTML) ===
            String subject = "Yêu cầu đặt lại mật khẩu - Auto 88";
            String content = """
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #333; text-align: center;">Yêu cầu khôi phục mật khẩu</h2>
                    <p>Xin chào,</p>
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.</p>
                    
                    <p style="text-align: center; margin: 30px 0;">
                        <a href="%s" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                            Đặt lại mật khẩu ngay
                        </a>
                    </p>
                    
                    <p style="font-size: 14px;">Hoặc bạn có thể sao chép đường dẫn sau vào trình duyệt:</p>
                    <p style="background-color: #f9f9f9; padding: 10px; font-size: 12px; color: #555; word-break: break-all;">
                        %s
                    </p>
                    
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #777; font-size: 12px; text-align: center;">Nếu bạn không yêu cầu thay đổi mật khẩu, vui lòng bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
                    <p style="color: #777; font-size: 12px; text-align: center;">Trân trọng,<br>Đội ngũ Auto 88</p>
                </div>
                """.formatted(resetLink, resetLink);

            emailService.sendHtmlEmail(email, subject, content);


            account.setResetAttempts(account.getResetAttempts() + 1);
            account.setLastResetAttempt(LocalDateTime.now());
            accountRepository.save(account);

        } catch (DataIntegrityViolationException e) {
            throw new AppException(ErrorCode.DUPLICATE_KEY, "Hệ thống đang xử lý, vui lòng chờ.");
        } catch (Exception e) {
            logger.error("Lỗi gửi mail forgot password", e);
            // Nếu gửi mail thất bại ở đây (ví dụ email bị xóa sau khi đã kích hoạt),
            // ta ném lỗi để Frontend biết
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể gửi email. Vui lòng thử lại sau.");
        }
    }

    // === ĐẶT LẠI MẬT KHẨU THÀNH CÔNG ===
    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Liên kết đặt lại mật khẩu không tồn tại."));

        if (resetToken.isExpired()) {
            throw new AppException(ErrorCode.INVALID_OR_EXPIRED_REFRESH_TOKEN, "Liên kết đặt lại mật khẩu đã hết hạn.");
        }

        Account account = resetToken.getAccount();

        // 1. Cập nhật mật khẩu mới
        account.setPassword(passwordEncoder.encode(newPassword));

        // 2. MỞ KHÓA: Reset số lần thử về 0 sau khi thành công
        account.setResetAttempts(0);
        account.setLastResetAttempt(null); // Reset luôn thời gian nếu muốn

        accountRepository.save(account);

        // 3. Xóa token
        passwordResetTokenRepository.delete(resetToken);
        passwordResetTokenRepository.flush();
    }
}