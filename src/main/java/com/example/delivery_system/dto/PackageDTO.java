package com.example.delivery_system.dto;

import com.example.delivery_system.entity.Package.PackageStatus;
import lombok.Data;

@Data
public class PackageDTO {
    private Long id;
    private String senderInfo;
    private String receiverInfo;
    private Double latitude;
    private Double longitude;
    private String packageDetails;
    private Double codAmount;
    private PackageStatus status;
    private String notes;
    private String proofOfDeliveryUrl;
    private Long deliveryTripId;
}