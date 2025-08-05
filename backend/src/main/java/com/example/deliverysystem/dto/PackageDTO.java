package com.example.deliverysystem.dto;

import com.example.deliverysystem.model.PackageStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PackageDTO {
    private Long id;
    @NotBlank(message = "Sender information is required")
    private String senderInfo;
    @NotBlank(message = "Receiver information is required")
    private String receiverInfo;
    @NotNull(message = "Latitude is required")
    private Double latitude;
    @NotNull(message = "Longitude is required")
    private Double longitude;
    private String packageDetails;
    private Double codAmount;
    private PackageStatus status; // Có thể để mặc định là PENDING khi tạo
    private String notes;
    private String proofOfDeliveryUrl;
    private Long deliveryTripId;
}