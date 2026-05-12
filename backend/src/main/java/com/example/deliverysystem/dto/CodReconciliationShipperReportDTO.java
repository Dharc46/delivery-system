package com.example.deliverysystem.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CodReconciliationShipperReportDTO {
    private Long shipperId;
    private String shipperName;
    private int packageCount;
    private double totalCodAmount;
    private List<CodReconciliationTripReportDTO> trips = new ArrayList<>();
}
