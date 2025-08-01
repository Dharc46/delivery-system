package com.example.delivery_system.dto;

import lombok.Data;

@Data
public class ShipperDTO {
    private Long id;
    private String fullName;
    private String phoneNumber;
    private Double currentLatitude;
    private Double currentLongitude;
    private Long userId;
}