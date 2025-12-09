package com.carshop.oto_shop.security.services;

import com.carshop.oto_shop.entities.Account;
import com.carshop.oto_shop.repositories.AccountRepository;
import com.carshop.oto_shop.security.models.CustomUserDetails;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    private final AccountRepository accountRepository;

    public CustomUserDetailsService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    /**
     * LƯU Ý QUAN TRỌNG:
     * Tên hàm "loadUserByUsername" là bắt buộc do implement interface UserDetailsService.
     * Spring Security sẽ tự động gọi hàm này khi đăng nhập.
     *
     * @param email Chính là giá trị email người dùng nhập vào form login
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Tìm kiếm trong DB bằng Email
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Tài khoản với email không tồn tại: " + email));

        return new CustomUserDetails(account);
    }

}