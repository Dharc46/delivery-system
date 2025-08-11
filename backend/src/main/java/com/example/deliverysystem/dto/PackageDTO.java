package com.example.deliverysystem.dto;

import com.example.deliverysystem.model.PackageStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.io.Serializable;

@Data
public class PackageDTO implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
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
    
    @DecimalMin(value = "0.0", message = "COD amount must be non-negative")
    private Double codAmount;
    
    private PackageStatus status = PackageStatus.PENDING; // Mặc định là PENDING
    
    private String notes;
    
    private String proofOfDeliveryUrl;
    
    private Long deliveryTripId;
    
    // Constructor mặc định (cần thiết cho serialization)
    public PackageDTO() {}
    
    // Constructor đầy đủ (optional, tiện cho testing)
    public PackageDTO(String senderInfo, String receiverInfo, Double latitude, 
                      Double longitude, String packageDetails, Double codAmount) {
        this.senderInfo = senderInfo;
        this.receiverInfo = receiverInfo;
        this.latitude = latitude;
        this.longitude = longitude;
        this.packageDetails = packageDetails;
        this.codAmount = codAmount;
        this.status = PackageStatus.PENDING;
    }
    
    // Utility methods
    public boolean isDelivered() {
        return PackageStatus.DELIVERED.equals(this.status);
    }
    
    public boolean hasCodAmount() {
        return this.codAmount != null && this.codAmount > 0;
    }
    
    public void markAsDelivered() {
        this.status = PackageStatus.DELIVERED;
    }
}