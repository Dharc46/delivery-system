package com.example.delivery_system.repository;

import com.example.delivery_system.entity.DeliveryTrip;
import com.example.delivery_system.entity.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface DeliveryTripRepository extends JpaRepository<DeliveryTrip, Long> {
    List<DeliveryTrip> findByTripDateAndStatus(LocalDate tripDate, TripStatus status);
}