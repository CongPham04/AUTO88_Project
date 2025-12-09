package com.carshop.oto_shop.services;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.BadRequestException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.dto.news.NewsRequestDto;
import com.carshop.oto_shop.dto.news.NewsResponseDto;
import com.carshop.oto_shop.entities.News;
import com.carshop.oto_shop.enums.NewsStatus;
import com.carshop.oto_shop.mappers.NewsMapper;
import com.carshop.oto_shop.repositories.NewsRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class NewsService {
    private static final Logger logger = LoggerFactory.getLogger(NewsService.class);

    private final NewsRepository newsRepository;
    private final NewsMapper newsMapper;

    public static final String UPLOAD_DIR = "uploads/news/";

    public NewsService(NewsRepository newsRepository, NewsMapper newsMapper) {
        this.newsRepository = newsRepository;
        this.newsMapper = newsMapper;
    }

    // ================= ADMIN METHODS =================

    @Transactional
    public List<NewsResponseDto> getAllNews() {
        return newsRepository.findAll().stream()
                .map(newsMapper::toNewsResponseDto) // Mapper tự xử lý URL
                .toList();
    }

    @Transactional
    public NewsResponseDto getNewsById(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        return newsMapper.toNewsResponseDto(news);
    }

    // ================= PUBLIC METHODS =================

    @Transactional
    public List<NewsResponseDto> getAllPublishedNews() {
        return newsRepository.findByStatusOrderByCreatedAtDesc(NewsStatus.PUBLISHED).stream()
                .map(newsMapper::toNewsResponseDto)
                .toList();
    }

    @Transactional
    public NewsResponseDto getPublishedNewsById(Long id) {
        News news = newsRepository.findByNewsIdAndStatus(id, NewsStatus.PUBLISHED)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        return newsMapper.toNewsResponseDto(news);
    }

    // ================= CRUD METHODS =================

    @Transactional
    public NewsResponseDto createNews(NewsRequestDto requestDto) {
        try {
            News news = newsMapper.toNews(requestDto);

            // Xử lý upload ảnh
            if (requestDto.getCoverImageFile() != null && !requestDto.getCoverImageFile().isEmpty()) {
                String imagePath = saveImage(requestDto.getCoverImageFile());
                news.setCoverImageUrl(imagePath); // Lưu đường dẫn vật lý vào DB
            }

            // Set default status
            if (news.getStatus() == null) news.setStatus(NewsStatus.DRAFT);
            if (news.getStatus() == NewsStatus.PUBLISHED) news.setPublishedAt(LocalDateTime.now());

            News savedNews = newsRepository.save(news);
            return newsMapper.toNewsResponseDto(savedNews);

        } catch (DataIntegrityViolationException ex) {
            throw new BadRequestException("Dữ liệu không hợp lệ hoặc bị trùng lặp");
        }
    }

    @Transactional
    public NewsResponseDto updateNews(Long id, NewsRequestDto requestDto) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));

        // Map các trường text
        newsMapper.updateNewsFromDto(requestDto, news);

        // Xử lý cập nhật ảnh (nếu có ảnh mới gửi lên)
        if (requestDto.getCoverImageFile() != null && !requestDto.getCoverImageFile().isEmpty()) {
            // Xoá ảnh cũ
            deleteImageFile(news.getCoverImageUrl());
            // Lưu ảnh mới
            String newPath = saveImage(requestDto.getCoverImageFile());
            news.setCoverImageUrl(newPath);
        }

        // Cập nhật ngày publish nếu chuyển sang PUBLISHED
        if (news.getStatus() == NewsStatus.PUBLISHED && news.getPublishedAt() == null) {
            news.setPublishedAt(LocalDateTime.now());
        }

        News updatedNews = newsRepository.save(news);
        return newsMapper.toNewsResponseDto(updatedNews);
    }

    @Transactional
    public void deleteNews(Long id) {
        News news = newsRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NEWS_NOT_FOUND));
        deleteImageFile(news.getCoverImageUrl());
        newsRepository.delete(news);
    }

    // ================= UTILS (File Handling) =================

    private String saveImage(MultipartFile file) {
        try {
            String contentType = file.getContentType();
            if (contentType == null || (!contentType.startsWith("image/"))) {
                throw new AppException(ErrorCode.UNSUPPORTED_MEDIA_TYPE);
            }

            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) uploadDir.mkdirs();

            // Tên file unique
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename().replaceAll("\\s+", "_");
            Path path = Paths.get(UPLOAD_DIR + fileName);

            Files.copy(file.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            return UPLOAD_DIR + fileName; // Trả về đường dẫn tương đối để lưu DB
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }

    private void deleteImageFile(String imagePath) {
        if (imagePath == null) return;
        try {
            Path filePath = Paths.get(imagePath).normalize();
            File file = filePath.toFile();
            if (file.exists()) {
                if(!file.delete()) {
                    logger.warn("Failed to delete file: {}", imagePath);
                }
            }
        } catch (Exception e) {
            logger.error("Error deleting file: {}", e.getMessage());
        }
    }
}