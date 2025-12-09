package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.User;
import com.carshop.oto_shop.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, JpaSpecificationExecutor<User> {
    boolean existsById(String userId);
    @Modifying
    @Query("DELETE FROM User u WHERE u.account.accountId = :accountId")
    void deleteAllByAccountId(@Param("accountId") String accountId);

    // Sửa findByAccount_Username thành Email
    Optional<User> findByAccount_Email(String email);
    // THÊM MỚI: Lấy danh sách User mà Account KHÔNG có trạng thái là status (để loại bỏ DELETED)
    List<User> findAllByAccount_StatusNot(AccountStatus status);
}
