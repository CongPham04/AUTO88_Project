package com.carshop.oto_shop.controllers;

import com.carshop.oto_shop.common.exceptions.AppException;
import com.carshop.oto_shop.common.exceptions.ErrorCode;
import com.carshop.oto_shop.common.response.ApiResponse;
import com.carshop.oto_shop.dto.news.NewsRequestDto;
import com.carshop.oto_shop.dto.news.NewsResponseDto;
import com.carshop.oto_shop.services.NewsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/news")
@Tag(name = "NewsController")
public class NewsController {

    private final NewsService newsService;
    public NewsController(NewsService newsService) {
        this.newsService = newsService;
    }

    // ================= PUBLIC API (Khách xem tin tức) =================

    @Operation(summary = "Get all published news", description = "API Public: Lấy danh sách tin tức đã xuất bản")
    @GetMapping("/published") // URL: /api/news/published
    public ResponseEntity<ApiResponse<List<NewsResponseDto>>> getAllPublishedNews() {
        List<NewsResponseDto> list = newsService.getAllPublishedNews();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tin tức thành công!", list));
    }

    @Operation(summary = "Get published news detail", description = "API Public: Xem chi tiết tin tức đã xuất bản")
    @GetMapping("/published/{id}") // URL: /api/news/published/{id}
    public ResponseEntity<ApiResponse<NewsResponseDto>> getPublishedNewsById(@PathVariable Long id) {
        NewsResponseDto dto = newsService.getPublishedNewsById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy tin tức thành công!", dto));
    }

    // ================= ADMIN API (Quản trị viên) =================

    @Operation(summary = "Get all news (Admin)", description = "API Admin: Lấy tất cả tin tức (kể cả Draft)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsResponseDto>>> getAllNewsAdmin() {
        // Hàm này dành cho trang quản trị
        return ResponseEntity.ok(ApiResponse.success("Lấy toàn bộ tin tức thành công!", newsService.getAllNews()));
    }

    @Operation(summary = "Get news detail (Admin)", description = "API Admin: Xem chi tiết tin tức bất kỳ")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponseDto>> getNewsByIdAdmin(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy tin tức thành công!", newsService.getNewsById(id)));
    }

    @Operation(summary = "Create news", description = "Admin: Thêm bài viết mới")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NewsResponseDto>> createNews(@Valid @ModelAttribute NewsRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Tạo bài viết thành công!", newsService.createNews(dto)));
    }

    @Operation(summary = "Update news", description = "Admin: Cập nhật bài viết")
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NewsResponseDto>> updateNews(@PathVariable Long id, @Valid @ModelAttribute NewsRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bài viết thành công!", newsService.updateNews(id, dto)));
    }

    @Operation(summary = "Delete news", description = "Admin: Xoá bài viết")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNews(@PathVariable Long id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok(ApiResponse.success("Xoá bài viết thành công!"));
    }

    // ================= COMMON API =================

    @GetMapping("/image/{filename:.+}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(NewsService.UPLOAD_DIR).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) throw new AppException(ErrorCode.FILE_NOT_FOUND);

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) contentType = "application/octet-stream";

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (MalformedURLException e) {
            throw new AppException(ErrorCode.FILE_NOT_FOUND);
        } catch (IOException e) {
            throw new AppException(ErrorCode.FILE_UPLOAD_ERROR);
        }
    }
}