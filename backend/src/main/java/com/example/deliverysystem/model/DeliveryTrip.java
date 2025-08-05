package com.example.deliverysystem.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryTrip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate tripDate; // Ngày chuyến đi

    @Enumerated(EnumType.STRING)
    private TripStatus status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shipper_id", nullable = false)
    private Shipper shipper; // FK đến tài xế

    @JdbcTypeCode(SqlTypes.JSON) // Sử dụng JSONB cho PostgreSQL
    @Column(columnDefinition = "jsonb")
    private String optimizedRouteData; // Dữ liệu tuyến đường tối ưu dạng JSON

    @OneToMany(mappedBy = "deliveryTrip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Package> packages; // Các đơn hàng thuộc chuyến đi này
}