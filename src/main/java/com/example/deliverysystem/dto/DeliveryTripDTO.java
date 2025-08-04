package com.example.deliverysystem.dto;

import com.example.deliverysystem.model.TripStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class DeliveryTripDTO {
    private Long id;
    private LocalDate tripDate;
    private TripStatus status;
    private Long shipperId;
    private String shipperName; // Tên shipper để hiển thị dễ hơn
    private String optimizedRouteData; // JSON string [cite: 23]
    private List<Long> packageIds; // Danh sách các ID đơn hàng trong chuyến đi
}