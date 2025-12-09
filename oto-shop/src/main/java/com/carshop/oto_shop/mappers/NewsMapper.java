package com.carshop.oto_shop.mappers;

import com.carshop.oto_shop.dto.news.NewsRequestDto;
import com.carshop.oto_shop.dto.news.NewsResponseDto;
import com.carshop.oto_shop.entities.News;
import org.mapstruct.*;

import java.nio.file.Paths;

@Mapper(componentModel = "spring")
public interface NewsMapper {

    String BASE_IMAGE_URL = "http://localhost:8080/carshop/api/news/image/";

    // 1. To Entity
    @Mapping(target = "newsId", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    News toNews(NewsRequestDto dto);

    // 2. To DTO (SỬA LỖI TẠI ĐÂY)
    // Sử dụng qualifiedByName để chỉ định rõ là dùng hàm "mapUrl" cho trường này
    @Mapping(target = "coverImageUrl", source = "coverImageUrl", qualifiedByName = "mapUrl")
    NewsResponseDto toNewsResponseDto(News news);

    // 3. Update Entity
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "newsId", ignore = true)
    @Mapping(target = "coverImageUrl", ignore = true)
    @Mapping(target = "publishedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateNewsFromDto(NewsRequestDto dto, @MappingTarget News news);

    // 4. Helper Method (SỬA LỖI TẠI ĐÂY)
    // Thêm @Named để MapStruct không tự động dùng hàm này cho các trường String khác (Title, Content...)
    @Named("mapUrl")
    default String mapCoverImageUrl(String originalUrl) {
        if (originalUrl == null || originalUrl.isEmpty()) {
            return null;
        }
        // Nếu là link online -> giữ nguyên
        if (originalUrl.startsWith("http://") || originalUrl.startsWith("https://")) {
            return originalUrl;
        }
        // Nếu là file local -> ghép link API
        String fileName = Paths.get(originalUrl).getFileName().toString();
        return BASE_IMAGE_URL + fileName;
    }
}