package com.example.delivery_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;

@Entity
@Data
public class DeliveryTrip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDate tripDate;

    @Enumerated(EnumType.STRING)
    private TripStatus status;

    @ManyToOne
    @JoinColumn(name = "shipper_id")
    private Shipper shipper;

    @JdbcTypeCode(SqlTypes.JSON)
    private String optimizedRouteData;
}

