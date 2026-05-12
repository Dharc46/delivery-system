package com.example.deliverysystem.repository;

import com.example.deliverysystem.model.Shipper;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ShipperRepository extends JpaRepository<Shipper, Long> {
	Optional<Shipper> findByUserUsername(String username);
}