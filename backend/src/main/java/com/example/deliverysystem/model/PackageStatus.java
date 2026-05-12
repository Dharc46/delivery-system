package com.example.deliverysystem.model;

import java.io.Serializable;

public enum PackageStatus implements Serializable {
    PENDING("Đang chờ xử lý"),
    IN_TRANSIT("Đang vận chuyển"),
    DELIVERED("Đã giao hàng"),
    FAILED("Giao hàng thất bại"),
    CANCELLED("Đã hủy");
    
    private final String description;
    
    PackageStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    // Utility methods
    public boolean isCompleted() {
        return this == DELIVERED || this == FAILED || this == CANCELLED;
    }
    
    public boolean isActive() {
        return this == PENDING || this == IN_TRANSIT;
    }
    
    public boolean isSuccessful() {
        return this == DELIVERED;
    }

    public static boolean isTransitionAllowed(PackageStatus currentStatus, PackageStatus nextStatus) {
        if (nextStatus == null) {
            return true;
        }

        PackageStatus normalizedCurrentStatus = currentStatus != null ? currentStatus : PENDING;

        if (normalizedCurrentStatus == nextStatus) {
            return true;
        }

        return switch (normalizedCurrentStatus) {
            case PENDING -> nextStatus == IN_TRANSIT || nextStatus == CANCELLED;
            case IN_TRANSIT -> nextStatus == DELIVERED || nextStatus == FAILED || nextStatus == CANCELLED;
            case DELIVERED, FAILED, CANCELLED -> false;
        };
    }
}