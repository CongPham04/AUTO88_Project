package com.carshop.oto_shop.mappers;

import com.carshop.oto_shop.dto.news.NewsRequestDto;
import com.carshop.oto_shop.dto.news.NewsResponseDto;
import com.carshop.oto_shop.entities.News;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Paths;

@Mapper(componentModel = "spring")
public abstract class NewsMapper {

    // Inject biến từ application.properties
    @Value("${app.base-url}")
    protected String appBaseUrl;

    // 1. To Entity
    @Mapping(target = "newsId", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract News toNews(NewsRequestDto dto);

    // 2. To DTO
    // Dùng qualifiedByName để gọi hàm xử lý link ảnh bên dưới
    @Mapping(target = "coverImageUrl", source = "coverImageUrl", qualifiedByName = "mapUrl")
    public abstract NewsResponseDto toNewsResponseDto(News news);

    // 3. Update Entity
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "newsId", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    public abstract void updateNewsFromDto(NewsRequestDto dto, @MappingTarget News news);

    // 4. Helper Method: Xử lý link ảnh Cover
    @Named("mapUrl")
    protected String mapCoverImageUrl(String originalUrl) {
        if (originalUrl == null || originalUrl.isEmpty()) {
            return null;
        }
        // Nếu là link online -> giữ nguyên
        if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
            return originalUrl;
        }

        // Nếu là file local -> lấy tên file và ghép với appBaseUrl
        String fileName = Paths.get(originalUrl).getFileName().toString();

        // Kết quả: http://auto88.id.vn/carshop/api/news/image/ten_anh.jpg
        return appBaseUrl + "/api/news/image/" + fileName;
    }
}