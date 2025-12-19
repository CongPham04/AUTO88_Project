package com.carshop.oto_shop.common.config;

import com.carshop.oto_shop.enums.Role;
import com.carshop.oto_shop.security.handers.AccessDeniedHandlerImpl;
import com.carshop.oto_shop.security.handers.AuthEntryPointJwt;
import com.carshop.oto_shop.security.jwt.JwtAuthenticationFilter;
import com.carshop.oto_shop.security.services.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final PasswordEncoder passwordEncoder;
    private final AuthEntryPointJwt authEntryPointJwt;
    private final AccessDeniedHandlerImpl accessDeniedHandler;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter,
                          CustomUserDetailsService userDetailsService,
                          PasswordEncoder passwordEncoder,
                          AuthEntryPointJwt authEntryPointJwt,
                          AccessDeniedHandlerImpl accessDeniedHandler) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
        this.passwordEncoder = passwordEncoder;
        this.authEntryPointJwt = authEntryPointJwt;
        this.accessDeniedHandler = accessDeniedHandler;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tắt CSRF (cho API stateless)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(authEntryPointJwt)
                        .accessDeniedHandler(accessDeniedHandler))
                .authorizeHttpRequests(auth -> auth
                        // ================== ALLOW PRE-FLIGHT ==================
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ================== SWAGGER UI ==================
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/swagger-resources/**",
                                "/webjars/**"
                        ).permitAll()

                        // ================== PUBLIC ENDPOINTS ==================
                        // Auth
                        .requestMatchers(HttpMethod.POST, "/api/auth/**").permitAll()

                        // Home & Meta
                        .requestMatchers(HttpMethod.GET, "/api/home/**", "/api/meta/**").permitAll()

                        // Public Assets (User avatars, etc.)
                        .requestMatchers(HttpMethod.GET, "/api/users/avatar/image/**").permitAll()

                        // ================== CARS (PUBLIC READ / ADMIN WRITE) ==================
                        // Public: Xem danh sách, chi tiết, tìm kiếm, so sánh, xem ảnh
                        // Dòng này bao gồm: /api/cars, /api/cars/{id}, /api/cars/search, /api/cars/compare, /api/cars/image/**
                        .requestMatchers(HttpMethod.GET, "/api/cars/**").permitAll()

                        // Admin: Thêm (Unified), Sửa (Unified), Xóa
                        .requestMatchers(HttpMethod.POST, "/api/cars/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.PUT, "/api/cars/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/cars/**").hasRole(Role.ADMIN.name())

                        // ================== USERS (SPECIFIC RULES FIRST) ==================
                        // Đổi mật khẩu (User + Admin)
                        .requestMatchers(HttpMethod.POST, "/api/users/change-password").hasAnyRole(Role.ADMIN.name(), Role.USER.name())

                        // Lấy thông tin theo email
                        .requestMatchers(HttpMethod.GET, "/api/users/email/{email}").hasAnyRole(Role.ADMIN.name(), Role.USER.name())

                        // Admin Search User
                        .requestMatchers(HttpMethod.GET, "/api/users/search").hasRole(Role.ADMIN.name())

                        // Users CRUD Generic (Update profile)
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasAnyRole(Role.ADMIN.name(), Role.USER.name())

                        // Admin Management (Create, Delete, Get All Users)
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasRole(Role.ADMIN.name())

                        // ================== ORDERS ==================
                        // 1. Admin Only Actions (Nghiệp vụ quản lý)
                        .requestMatchers(HttpMethod.GET, "/api/orders").hasRole(Role.ADMIN.name()) // ✅ Lấy TẤT CẢ đơn hàng
                        .requestMatchers(HttpMethod.GET, "/api/orders/status/**").hasRole(Role.ADMIN.name()) // ✅ Lọc trạng thái toàn hệ thống
                        .requestMatchers(HttpMethod.DELETE, "/api/orders/**").hasRole(Role.ADMIN.name()) // Xoá đơn
                        .requestMatchers(HttpMethod.PATCH, "/api/orders/*/status").hasRole(Role.ADMIN.name()) // Cập nhật trạng thái

                        // 2. Shared Actions (Cá nhân User & Admin xem chi tiết)
                        .requestMatchers(HttpMethod.GET, "/api/orders/user/{userId}").hasAnyRole(Role.ADMIN.name(), Role.USER.name()) // ✅ Lịch sử đơn của user
                        .requestMatchers(HttpMethod.GET, "/api/orders/{orderId}").hasAnyRole(Role.ADMIN.name(), Role.USER.name()) // ✅ Xem chi tiết đơn
                        .requestMatchers(HttpMethod.GET, "/api/orders/{orderId}/details").hasAnyRole(Role.ADMIN.name(), Role.USER.name()) // ✅ Xem item trong đơn

                        // 3. User Actions
                        .requestMatchers(HttpMethod.POST, "/api/orders/*/cancel").hasAnyRole(Role.ADMIN.name(), Role.USER.name()) // Hủy đơn
                        .requestMatchers(HttpMethod.POST, "/api/orders").hasAnyRole(Role.ADMIN.name(), Role.USER.name()) // Tạo đơn mới

                        // ================== PAYMENTS ==================
                        .requestMatchers(HttpMethod.PATCH, "/api/payments/**").hasRole(Role.ADMIN.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/payments/**").hasRole(Role.ADMIN.name())
                        .requestMatchers("/api/payments/**").hasAnyRole(Role.ADMIN.name(), Role.USER.name())

                        // ================== PROMOTIONS ==================
                        .requestMatchers(HttpMethod.GET, "/api/promotions/**").permitAll()
                        .requestMatchers("/api/promotions/**").hasRole(Role.ADMIN.name())

                        // ================== NEWS ==================
                                // 1. Public Access (Khách xem tin published)
                                .requestMatchers(HttpMethod.GET, "/api/news/published/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/news/image/**").permitAll()

                                // 2. Admin Access (Quản lý tin tức)
                                // Các endpoint còn lại của /api/news/** (GET all, POST, PUT, DELETE) sẽ yêu cầu quyền ADMIN
                                .requestMatchers("/api/news/**").hasRole(Role.ADMIN.name())
                        // ================== REVIEWS ==================
                        // 1. PUBLIC READ: Xem tất cả đánh giá của một xe
                        .requestMatchers(HttpMethod.GET, "/api/reviews/car/**").permitAll()

                        // 2. USER/ADMIN ACTIONS: Thêm, kiểm tra
                        .requestMatchers(HttpMethod.POST, "/api/reviews").hasAnyRole(Role.ADMIN.name(), Role.USER.name())
                        .requestMatchers(HttpMethod.GET, "/api/reviews/order-detail/**").hasAnyRole(Role.ADMIN.name(), Role.USER.name())

                        // 3. ADMIN MANAGEMENT: GET All, PATCH, DELETE
                        // Dòng này bao phủ: GET /api/reviews, PATCH /api/reviews/{id}/approve, DELETE /api/reviews/{id}
                        .requestMatchers("/api/reviews/**").hasRole(Role.ADMIN.name())
                        // ================== ADMIN DASHBOARD ==================
                        .requestMatchers("/api/admin/**").hasRole(Role.ADMIN.name())

                        // ================== FALLBACK ==================
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}