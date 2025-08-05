package com.example.deliverysystem.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipperDTO {
    private Long id;
    @NotBlank(message = "Full name is required")
    private String fullName;
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    private Double currentLatitude;
    private Double currentLongitude;
    @NotBlank(message = "Username is required")
    private String username; // Để tạo tài khoản đăng nhập cho shipper
    @NotBlank(message = "Password is required")
    private String password;
}