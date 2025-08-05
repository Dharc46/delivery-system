package com.example.deliverysystem.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Package {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String senderInfo; // Tên, SĐT, Địa chỉ người gửi

    @Column(nullable = false)
    private String receiverInfo; // Tên, SĐT, Địa chỉ người nhận

    private Double latitude; // Vĩ độ điểm giao hàng
    private Double longitude; // Kinh độ điểm giao hàng

    private String packageDetails;
    private Double codAmount; // Số tiền COD

    @Enumerated(EnumType.STRING)
    private PackageStatus status; // PENDING, IN_TRANSIT, DELIVERED, FAILED

    private String notes;
    private String proofOfDeliveryUrl; // URL ảnh bằng chứng giao hàng

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_trip_id")
    private DeliveryTrip deliveryTrip; // FK đến chuyến giao hàng
}