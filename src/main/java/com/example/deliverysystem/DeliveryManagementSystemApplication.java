package com.example.deliverysystem;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching; // Thêm annotation này

@SpringBootApplication
@EnableCaching // Kích hoạt caching
public class DeliveryManagementSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(DeliveryManagementSystemApplication.class, args);
    }

}