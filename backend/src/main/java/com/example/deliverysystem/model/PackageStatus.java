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
}