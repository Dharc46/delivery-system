package com.example.deliverysystem.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class CodReconciliationDailyReportDTO {
    private LocalDate date;
    private int packageCount;
    private double totalCodAmount;
    private List<CodReconciliationShipperReportDTO> shippers = new ArrayList<>();
}
