package com.example.deliverysystem.security;

import com.example.deliverysystem.model.Role;
import com.example.deliverysystem.security.jwt.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value; // Thêm import này
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry; // Thêm import này
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer; // Thêm import này

import java.nio.file.Paths; // Thêm import này

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Cho phép phân quyền bằng @PreAuthorize
@RequiredArgsConstructor
public class SecurityConfig implements WebMvcConfigurer { // <--- Thêm implements WebMvcConfigurer

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    @Value("${file.upload-dir}") // <--- Lấy đường dẫn thư mục upload từ application.properties
    private String uploadDir;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/v1/auth/**").permitAll() // Cho phép đăng nhập không cần xác thực
                        .requestMatchers("/api/v1/customer/packages/**").permitAll() // Trang tracking khách hàng công khai
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll() // Swagger UI
                        .requestMatchers("/api/v1/files/**").permitAll() // <--- Cho phép truy cập các file đã upload (ảnh bằng chứng)
                        // Sửa lỗi ở đây: Sử dụng đúng tên ROLE_ADMIN và ROLE_SHIPPER
                        .requestMatchers("/api/v1/admin/**").hasRole(Role.ROLE_ADMIN.name().replace("ROLE_", "")) // Chỉ ADMIN
                        .requestMatchers("/api/v1/shipper/**").hasRole(Role.ROLE_SHIPPER.name().replace("ROLE_", "")) // Chỉ SHIPPER
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // <--- Thêm phương thức này để phục vụ tài nguyên tĩnh (static resources)
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Đảm bảo đường dẫn file là URI hợp lệ
        // `Paths.get(uploadDir).toAbsolutePath().normalize()` chuyển đổi đường dẫn tương đối thành tuyệt đối và chuẩn hóa
        // `.toString().replace("\\", "/")` xử lý dấu gạch chéo ngược trên Windows để tạo URI hợp lệ
        String fileStoragePath = "file:///" + Paths.get(uploadDir).toAbsolutePath().normalize().toString().replace("\\", "/");
        registry.addResourceHandler("/api/v1/files/**") // URL pattern mà client sẽ gọi (ví dụ: /api/v1/files/my-image.jpg)
                .addResourceLocations(fileStoragePath + "/"); // Nơi các file được lưu trữ trên hệ thống file
    }
}