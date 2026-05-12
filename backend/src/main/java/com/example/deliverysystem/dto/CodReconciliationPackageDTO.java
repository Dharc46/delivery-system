package com.example.deliverysystem.dto;

import com.example.deliverysystem.model.PackageStatus;
import lombok.Data;

import java.time.Instant;

@Data
public class CodReconciliationPackageDTO {
    private Long packageId;
    private Double codAmount;
    private PackageStatus status;
    private Instant reconciledAt;
    private String reconciledBy;
}
