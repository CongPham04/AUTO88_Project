package com.carshop.oto_shop.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI(@Value("${swagger.title}") String title,
                                 @Value("${swagger.version}") String version,
                                 @Value("${swagger.description}") String description,
                                 @Value("${swagger.contact-name}") String contactName,
                                 @Value("${swagger.contact-email}") String contactEmail) {
        return new OpenAPI()
                .info(new Info()
                        .title(title)
                        .version(version)
                        .description(description)
                        .contact(new Contact()
                                .name(contactName)
                                .email(contactEmail)))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .components(new io.swagger.v3.oas.models.Components()
                        .addSecuritySchemes("BearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    // ================== ALL API ==================
    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("1. All API")
                .pathsToMatch("/**")
                .build();
    }

    // ================== PUBLIC API ==================
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("2. Public API")
                .pathsToMatch(
                        "/api/auth/**",
                        "/api/home/**",
                        "/api/meta/**",
                        "/api/cars/**",      // Đã bao gồm: image, search, compare, details
                        "/api/promotions/**",
                        // ✅ CẬP NHẬT: Chỉ hiển thị các API tin tức công khai
                        "/api/news/published/**",
                        "/api/news/image/**",
                        "/api/users/avatar/image/**"
                )
                .build();
    }

    // ================== USER API ==================
    @Bean
    public GroupedOpenApi userApi() {
        return GroupedOpenApi.builder()
                .group("3. User API")
                .pathsToMatch(
                        "/api/orders/**",
                        "/api/payments/**",
                        "/api/users/**"
                )
                .build();
    }

    // ================== ADMIN API ==================
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("4. Admin API")
                .pathsToMatch(
                        "/api/admin/**",
                        "/api/users/**",
                        "/api/cars/**",      // Admin quản lý xe
                        "/api/orders/**",
                        "/api/payments/**",
                        "/api/promotions/**",
                        "/api/news/**"
                )
                .build();
    }
}