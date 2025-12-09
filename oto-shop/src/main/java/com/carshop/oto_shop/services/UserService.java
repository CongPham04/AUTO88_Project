package com.carshop.oto_shop.services;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.BadRequestException;
import com.carshop.oto_shop.common.exceptions.DuplicateKeyException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.dto.user.*;
import com.carshop.oto_shop.entities.Account;
import com.carshop.oto_shop.entities.User;
import com.carshop.oto_shop.enums.AccountStatus;
import com.carshop.oto_shop.enums.Role;
import com.carshop.oto_shop.mappers.UserMapper;
import com.carshop.oto_shop.repositories.AccountRepository;
import com.carshop.oto_shop.repositories.PasswordResetTokenRepository;
import com.carshop.oto_shop.repositories.UserRepository;
import jakarta.persistence.criteria.Predicate;
import jakarta.transaction.Transactional;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {
    private static final Logger logger = LoggerFactory.getLogger(UserService.class);
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;

    public static final String UPLOAD_DIR = "uploads/avatars/";
    private static final String BASE_IMAGE_URL = "http://localhost:8080/carshop/api/users/avatar/image/";

    public UserService(UserMapper userMapper, UserRepository userRepository, AccountRepository accountRepository, PasswordEncoder passwordEncoder, PasswordResetTokenRepository passwordResetTokenRepository) {
        this.userMapper = userMapper;
        this.userRepository = userRepository;
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    public void CreateUser(UserRequest userRequest, String accountId) {
        try{
            Account account = accountRepository.findById(accountId)
                    .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));
            User user = userMapper.toUser(userRequest);
            String avatarUrl = null;
            if (userRequest.getAvatarFile() != null && !userRequest.getAvatarFile().isEmpty()) {
                avatarUrl = saveAvatar(userRequest.getAvatarFile());
            }
            user.setAccount(account);
            user.setAvatarUrl(avatarUrl);
            userRepository.save(user);
        }catch (DataIntegrityViolationException e){
            String message = e.getMostSpecificCause().getMessage(); //lấy message gốc từ DB
            logger.error("DataIntegrityViolationException caught: {}", message);
            if(message != null){
                if(message.contains("uk_users_phone")) {
                    throw new DuplicateKeyException("Số điện thoại đã tồn tại!");
                }else if(message.contains(accountId)){
                    throw new DuplicateKeyException("Người dùng cho tài khoản này đã tồn tại!");
                }else if (message.contains("cannot be null")) {
                    // Lấy ra tên cột bị null từ message (ví dụ: "Column 'password' cannot be null")
                    String field = message.substring(message.indexOf("'") + 1, message.lastIndexOf("'"));
                    throw new BadRequestException(field + " không được để trống!");
                }else{
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
            }else{
                throw new AppException(ErrorCode.UNKNOWN);
            }

        }

    }

    private String saveAvatar(MultipartFile file) {
        try{
            String contentType = file.getContentType();
            if (contentType == null ||
                    (!contentType.equals("image/png")
                            && !contentType.equals("image/jpeg")
                            && !contentType.equals("application/pdf"))) {
                throw new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
            }

            File uploadDir = new File(UPLOAD_DIR);
            if(!uploadDir.exists()){
                uploadDir.mkdirs();
            }

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);
            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);

            return UPLOAD_DIR + fileName;
        }catch (IOException e){
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }


    public void UpdateUser(UserRequest userRequest, String userId) {
        try{
            User user = userRepository.findById(userId)
                    .orElseThrow(() ->new AppException(ErrorCode.USER_NOT_FOUND));
            userMapper.updateUser(userRequest, user);
            userRepository.save(user);
        }catch (DataIntegrityViolationException e){
            String message = e.getMostSpecificCause().getMessage(); //lấy message gốc từ DB
            logger.error("DataIntegrityViolationException caught: {}", message);
            if(message != null){
                if(message.contains("uk_users_phone")) {
                    throw new DuplicateKeyException("Số điện thoại đã tồn tại!");
                }else if (message.contains("cannot be null")) {
                    // Lấy ra tên cột bị null từ message (ví dụ: "Column 'password' cannot be null")
                    String field = message.substring(message.indexOf("'") + 1, message.lastIndexOf("'"));
                    throw new BadRequestException(field + " không được để trống!");
                }else{
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
            }else{
                throw new AppException(ErrorCode.UNKNOWN);
            }

        }
    }

    /**
     * Update both User and Account information
     * @param request Request containing user and account fields to update
     * @param userId User ID
     * @return Updated UserResponse with full information
     */
    @Transactional
    public void updateUserWithAccount(UserUpdateRequest request, String userId) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

            Account account = user.getAccount();
            if (account == null) throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);

            // --- Cập nhật thông tin User (chung cho cả Admin và User) ---
            if (request.getFullName() != null) user.setFullName(request.getFullName());
            if (request.getDob() != null) user.setDob(request.getDob());
            if (request.getGender() != null) user.setGender(request.getGender());
            if (request.getPhone() != null) user.setPhone(request.getPhone());
            if (request.getAddress() != null) user.setAddress(request.getAddress());

            // Xử lý Avatar
            if (request.getAvatarFile() != null && !request.getAvatarFile().isEmpty()) {
                deleteAvatarFile(user.getAvatarUrl());
                String newAvatarUrl = saveAvatar(request.getAvatarFile());
                user.setAvatarUrl(newAvatarUrl);
            }

            // --- Cập nhật thông tin Account ---

            // Lấy thông tin người đang thực hiện request
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_" + Role.ADMIN.name()));

            // 1. Email: Cả 2 đều có thể sửa (hoặc tùy nghiệp vụ, thường email ít cho sửa)
            if (request.getEmail() != null) account.setEmail(request.getEmail());

            // 2. Password: ✅ CHỈ ADMIN MỚI ĐƯỢC SỬA Ở API NÀY
            if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
                if (isAdmin) {
                    account.setPassword(passwordEncoder.encode(request.getPassword()));
                } else {
                    // Nếu là User thường, dù có gửi password lên cũng BỎ QUA (không lỗi, chỉ không update)
                    logger.warn("User {} tried to update password via update profile API. Action ignored.", userId);
                }
            }

            // 3. Role & Status: ✅ CHỈ ADMIN MỚI ĐƯỢC SỬA
            if (isAdmin) {
                if (request.getRole() != null) account.setRole(request.getRole());
                if (request.getStatus() != null) account.setStatus(request.getStatus());
            }

            accountRepository.save(account);
            User savedUser = userRepository.save(user);
            userMapper.toUserResponse(savedUser); // Cái này hình như thừa, hàm này void mà? Nhưng giữ nguyên logic cũ.

        } catch (DataIntegrityViolationException e) {
            // ... (Giữ nguyên logic catch cũ) ...
            String message = e.getMostSpecificCause().getMessage();
            if (message != null && message.contains("uk_accounts_email")) {
                throw new DuplicateKeyException("Email đã tồn tại!");
            } else if (message != null && message.contains("uk_users_phone")) {
                throw new DuplicateKeyException("Số điện thoại đã tồn tại!");
            }
            throw new AppException(ErrorCode.BAD_REQUEST);
        } catch (Exception e) {
            logger.error("Error updating user: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNKNOWN);
        }
    }

    // ================== 2. TÌM KIẾM & LỌC NGƯỜI DÙNG (REQUIREMENT 1 - ADMIN) ==================
    public List<UserResponse> searchUsers(String keyword, Role role, AccountStatus status) {
        Specification<User> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Join bảng Account để lấy thông tin email, role, status
            // 'account' là tên field trong entity User
            var accountJoin = root.join("account");

            // 1. Lọc theo Keyword (Tìm theo tên, email hoặc số điện thoại)
            if (StringUtils.hasText(keyword)) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                Predicate namePredicate = criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), likePattern);
                Predicate phonePredicate = criteriaBuilder.like(root.get("phone"), likePattern);
                Predicate emailPredicate = criteriaBuilder.like(criteriaBuilder.lower(accountJoin.get("email")), likePattern);

                // (Name OR Phone OR Email)
                predicates.add(criteriaBuilder.or(namePredicate, phonePredicate, emailPredicate));
            }

            // 2. Lọc theo Role
            if (role != null) {
                predicates.add(criteriaBuilder.equal(accountJoin.get("role"), role));
            }

            // 3. Lọc theo Status
            if (status != null) {
                predicates.add(criteriaBuilder.equal(accountJoin.get("status"), status));
            } else {
                // Mặc định không lấy DELETED trừ khi admin muốn xem lịch sử (tùy nghiệp vụ)
                // Ở đây ta ẩn DELETED giống hàm getAllUsers
                predicates.add(criteriaBuilder.notEqual(accountJoin.get("status"), AccountStatus.DELETED));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        List<User> users = userRepository.findAll(spec);

        // Map sang Response
        return users.stream().map(user -> {
            UserResponse res = userMapper.toUserResponse(user);
            if (user.getAvatarUrl() != null) {
                String fileName = Paths.get(user.getAvatarUrl()).getFileName().toString();
                res.setAvatarUrl(BASE_IMAGE_URL + fileName);
            }
            return res;
        }).toList();
    }

    // ================== 3. ĐỔI MẬT KHẨU (REQUIREMENT 1 - USER) ==================
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        // Lấy User đang đăng nhập từ Security Context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName(); // JWT subject là email

        Account account = accountRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new AppException(ErrorCode.ACCOUNT_NOT_FOUND));

        // 1. Kiểm tra xác nhận mật khẩu
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException(ErrorCode.BAD_REQUEST,"Mật khẩu xác nhận không khớp!");
        }

        // 2. Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.BAD_REQUEST,"Mật khẩu cũ không chính xác!");
        }

        // 3. Cập nhật mật khẩu mới
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    private void deleteAvatarFile(String avatarUrl) {
        if (avatarUrl == null) return;
        try {
            String fileName = Paths.get(avatarUrl).getFileName().toString();
            Path filePath = Paths.get(UPLOAD_DIR).resolve(fileName).normalize();
            File file = filePath.toFile();
            if (file.exists()) {
                boolean deleted = file.delete();
                if (deleted) {
                    logger.info("Đã xoá avatar: " + filePath);
                } else {
                    logger.warn("Không thể xoá avatar: " + filePath);
                }
            }
        } catch (Exception e) {
            logger.error("Lỗi khi xoá avatar: " + e.getMessage());
        }
    }

    /**
     * Soft Delete User: Chuyển trạng thái Account sang DELETED
     * Thay vì xóa vật lý khỏi database.
     * @param userId User ID to soft delete
     */
    @Transactional
    public void DeleteUser(String userId) {
        // 1. Tìm User
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Account account = user.getAccount();
        if (account == null) {
            throw new AppException(ErrorCode.ACCOUNT_NOT_FOUND);
        }

        // 2. Kiểm tra nếu đã xóa rồi thì thôi (Optional)
        if (account.getStatus() == AccountStatus.DELETED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Người dùng này đã bị xóa trước đó.");
        }

        try {
            // 3. Cập nhật trạng thái sang DELETED
            account.setStatus(AccountStatus.DELETED);

            // (Tùy chọn) Có thể xóa token reset password để user không thể khôi phục mật khẩu nữa
            passwordResetTokenRepository.deleteByAccount(account);

            // 4. Lưu lại thay đổi
            accountRepository.save(account);

            logger.info("Soft deleted User {} (Account {})", userId, account.getAccountId());

        } catch (Exception e) {
            logger.error("Error soft deleting user: {}", e.getMessage());
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi khi xóa người dùng.");
        }
    }

    public UserResponse getUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->new AppException(ErrorCode.USER_NOT_FOUND));
        UserResponse response = userMapper.toUserResponse(user);
        if(user.getAvatarUrl() != null){
            // Thay "/uploads/xxx.png" thành full URL API
            String fileName = Paths.get(user.getAvatarUrl()).getFileName().toString();
            response.setAvatarUrl(BASE_IMAGE_URL + fileName);
        }
        return response;
    }

    // ✅ CẬP NHẬT: Lấy danh sách user (Trừ những người đã bị xóa)
    public List<UserResponse> getAllUsers() {
        // Sử dụng hàm mới trong Repository để lọc bỏ DELETED
        List<User> users = userRepository.findAllByAccount_StatusNot(AccountStatus.DELETED);

        return users.stream()
                .map(user -> {
                    UserResponse response = userMapper.toUserResponse(user);
                    if (user.getAvatarUrl() != null) {
                        String fileName = Paths.get(user.getAvatarUrl()).getFileName().toString();
                        response.setAvatarUrl(BASE_IMAGE_URL + fileName);
                    }
                    return response;
                })
                .toList();
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByAccount_Email(email)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        UserResponse response = userMapper.toUserResponse(user);
        if(user.getAvatarUrl() != null){
            // Thay "/uploads/xxx.png" thành full URL API
            String fileName = Paths.get(user.getAvatarUrl()).getFileName().toString();
            response.setAvatarUrl(BASE_IMAGE_URL + fileName);
        }
        return response;
    }

    /**
     * Create both Account and User in a single transaction
     * @param request Combined request containing both account and user information
     * @return UserResponse with full account and user information
     */
    @Transactional
    public UserResponse createUserWithAccount(UserAccountRequest request) {
        try {
            // Step 1: Create Account
            Account account = new Account();
            account.setEmail(request.getEmail());
            account.setEmail(request.getEmail());
            account.setPassword(passwordEncoder.encode(request.getPassword()));
            account.setRole(request.getRole() != null ? request.getRole() : Role.USER);
            account.setStatus(request.getStatus() != null ? request.getStatus() : AccountStatus.ACTIVE);

            // Save account first
            Account savedAccount = accountRepository.save(account);
            logger.info("Created account with ID: {}", savedAccount.getAccountId());

            // Step 2: Create User
            User user = new User();
            user.setAccount(savedAccount);
            user.setFullName(request.getFullName());
            user.setDob(request.getDob());
            user.setGender(request.getGender());
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());

            // Handle avatar upload if provided
            String avatarUrl = null;
            if (request.getAvatarFile() != null && !request.getAvatarFile().isEmpty()) {
                avatarUrl = saveAvatar(request.getAvatarFile());
            }
            user.setAvatarUrl(avatarUrl);

            // Save user
            User savedUser = userRepository.save(user);
            logger.info("Created user with ID: {} for account: {}", savedUser.getUserId(), savedAccount.getAccountId());

            // Step 3: Build response
            UserResponse response = userMapper.toUserResponse(savedUser);
            if (avatarUrl != null) {
                String fileName = Paths.get(avatarUrl).getFileName().toString();
                response.setAvatarUrl(BASE_IMAGE_URL + fileName);
            }

            return response;

        } catch (DataIntegrityViolationException e) {
            String message = e.getMostSpecificCause().getMessage();
            logger.error("DataIntegrityViolationException caught: {}", message);

            if (message != null) {
                if (message.contains("uk_accounts_email")) {
                    throw new DuplicateKeyException("Email đã tồn tại!");
                } else if (message.contains("uk_users_phone")) {
                    throw new DuplicateKeyException("Số điện thoại đã tồn tại!");
                } else if (message.contains("cannot be null")) {
                    String field = message.substring(message.indexOf("'") + 1, message.lastIndexOf("'"));
                    throw new BadRequestException(field + " không được để trống!");
                } else {
                    throw new AppException(ErrorCode.BAD_REQUEST);
                }
            } else {
                throw new AppException(ErrorCode.UNKNOWN);
            }
        } catch (Exception e) {
            logger.error("Error creating user with account: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.UNKNOWN);
        }
    }
}
