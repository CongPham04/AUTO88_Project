package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.Car;
import com.carshop.oto_shop.enums.Brand;
import com.carshop.oto_shop.enums.Category;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
// [THÊM MỚI] Import thư viện Specification
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

// [SỬA ĐỔI] Thêm JpaSpecificationExecutor<Car>
public interface CarRepository extends JpaRepository<Car, Long>, JpaSpecificationExecutor<Car> {
    List<Car> findAllByCategory(Category category);
    List<Car> findAllByBrand(Brand brand);
    // --- DASHBOARD QUERIES ---

    // 1. Tính tổng số lượng xe đang có trong kho (Dùng cho Card "Tổng xe trong kho")
    @Query("SELECT COALESCE(SUM(c.quantity), 0) FROM Car c")
    long sumTotalQuantity();

    // 2. Tìm xe có số lượng thấp hơn mức cảnh báo (Dùng cho bảng "Cảnh báo tồn kho")
    List<Car> findByQuantityLessThanOrderByQuantityAsc(Integer quantity, Pageable pageable);
}