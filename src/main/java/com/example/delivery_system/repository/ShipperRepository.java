package com.example.delivery_system.repository;

import com.example.delivery_system.entity.Shipper;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipperRepository extends JpaRepository<Shipper, Long> {
}