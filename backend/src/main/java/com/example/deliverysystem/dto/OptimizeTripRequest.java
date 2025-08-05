package com.example.deliverysystem.dto;

import lombok.Data;
import java.util.List;

@Data
public class OptimizeTripRequest {
    private Long shipperId;
    private List<Long> packageIds;
}