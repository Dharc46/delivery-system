package com.example.delivery_system.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Shipper {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String phoneNumber;
    private Double currentLatitude;
    private Double currentLongitude;

    @OneToOne
    @JoinColumn(name = "user_id")
    private User user;
}