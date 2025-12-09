package com.carshop.oto_shop.repositories;

import com.carshop.oto_shop.entities.News;
import com.carshop.oto_shop.enums.NewsStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NewsRepository extends JpaRepository<News, Long> {
    // Tìm tất cả tin tức có trạng thái cụ thể (Dùng cho Public API lấy danh sách PUBLISHED)
    List<News> findByStatusOrderByCreatedAtDesc(NewsStatus status);

    // Tìm tin tức theo ID và Trạng thái (Dùng cho Public API xem chi tiết)
    Optional<News> findByNewsIdAndStatus(Long newsId, NewsStatus status);
}
