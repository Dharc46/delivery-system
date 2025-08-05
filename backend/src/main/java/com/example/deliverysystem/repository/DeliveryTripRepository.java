package com.example.deliverysystem.repository;

import com.example.deliverysystem.model.DeliveryTrip;
import com.example.deliverysystem.model.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface DeliveryTripRepository extends JpaRepository<DeliveryTrip, Long> {
    List<DeliveryTrip> findByShipperIdAndTripDate(Long shipperId, LocalDate tripDate);
    List<DeliveryTrip> findByStatus(TripStatus status);
}