package com.example.deliverysystem.dto;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CodReconciliationReportDTO {
    private int packageCount;
    private double totalCodAmount;
    private List<CodReconciliationDailyReportDTO> days = new ArrayList<>();
}
