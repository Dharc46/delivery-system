package com.example.deliverysystem.controller;

import com.example.deliverysystem.dto.PackageDTO;
import com.example.deliverysystem.service.PackageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/customer/packages")
@RequiredArgsConstructor
@Tag(name = "Customer Tracking", description = "Public API for customers to track their packages")
public class CustomerPackageController {

    private final PackageService packageService;

    @Operation(summary = "Get package details by ID (for public tracking)")
    @GetMapping("/{packageId}")
    public ResponseEntity<PackageDTO> getPackageForCustomer(@PathVariable Long packageId) {
        PackageDTO pkg = packageService.getPackageById(packageId); // Sử dụng cache của PackageService [cite: 62]
        // Có thể filter thông tin nhạy cảm trước khi trả về khách hàng nếu cần
        return ResponseEntity.ok(pkg);
    }

    // TODO: API để lấy vị trí shipper và ETA (nếu có) [cite: 61]
    // Đây sẽ yêu cầu Shipper gửi vị trí liên tục và DeliveryTrip có ETA dự kiến.
}