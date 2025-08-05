package com.example.deliverysystem.repository;

import com.example.deliverysystem.model.Shipper;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ShipperRepository extends JpaRepository<Shipper, Long> {
}