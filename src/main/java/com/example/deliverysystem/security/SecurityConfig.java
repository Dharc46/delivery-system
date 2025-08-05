package com.example.deliverysystem.security;

     import com.example.deliverysystem.model.Role;
     import com.example.deliverysystem.security.jwt.JwtAuthFilter;
     import lombok.RequiredArgsConstructor;
     import org.springframework.beans.factory.annotation.Value;
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
     import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
     import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

     import java.nio.file.Paths;

     @Configuration
     @EnableWebSecurity
     @EnableMethodSecurity
     @RequiredArgsConstructor
     public class SecurityConfig implements WebMvcConfigurer {

         private final JwtAuthFilter jwtAuthFilter;
         private final AuthenticationProvider authenticationProvider;

         @Value("${file.upload-dir}")
         private String uploadDir;

         @Bean
         public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
             http
                 .csrf(AbstractHttpConfigurer::disable)
                 .authorizeHttpRequests(authorize -> authorize
                     // Cho phép truy cập công khai trước
                     .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/error").permitAll()
                     .requestMatchers("/api/v1/auth/**").permitAll()
                     .requestMatchers("/api/v1/customer/packages/**").permitAll()
                     .requestMatchers("/api/v1/files/**").permitAll()
                     .requestMatchers("/api/v1/admin/**").hasRole(Role.ROLE_ADMIN.name().replace("ROLE_", ""))
                     .requestMatchers("/api/v1/shipper/**").hasRole(Role.ROLE_SHIPPER.name().replace("ROLE_", ""))
                     // Tất cả các yêu cầu khác cần xác thực
                     .anyRequest().authenticated()
                 )
                 .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                 .authenticationProvider(authenticationProvider)
                 .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

             return http.build();
         }

         @Override
         public void addResourceHandlers(ResourceHandlerRegistry registry) {
             String fileStoragePath = "file:///" + Paths.get(uploadDir).toAbsolutePath().normalize().toString().replace("\\", "/");
             registry.addResourceHandler("/api/v1/files/**")
                     .addResourceLocations(fileStoragePath + "/");
         }
     }