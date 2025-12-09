package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.Account;
import com.carshop.oto_shop.entities.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    void deleteByAccount(Account account);
}