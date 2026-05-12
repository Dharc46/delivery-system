package com.example.deliverysystem.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class CodReconciliationTripReportDTO {
    private Long tripId;
    private LocalDate tripDate;
    private Long shipperId;
    private String shipperName;
    private int packageCount;
    private double totalCodAmount;
    private List<CodReconciliationPackageDTO> packages = new ArrayList<>();
}
