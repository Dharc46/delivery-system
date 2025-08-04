package com.example.deliverysystem.controller;

import com.example.deliverysystem.dto.DeliveryTripDTO;
import com.example.deliverysystem.dto.PackageDTO;
import com.example.deliverysystem.model.PackageStatus;
import com.example.deliverysystem.service.DeliveryTripService;
import com.example.deliverysystem.service.PackageService;
import com.example.deliverysystem.service.storage.FileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder; // <--- Thêm import này nếu bạn dùng cách 1b (Fully Qualified URL)

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/v1/shipper")
@RequiredArgsConstructor
@Tag(name = "Shipper API", description = "API for delivery drivers to manage their tasks")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('SHIPPER')") // Chỉ SHIPPER được phép truy cập controller này
public class ShipperController {

    private final DeliveryTripService deliveryTripService;
    private final PackageService packageService;
    private final FileService fileService;

    @Operation(summary = "Get all delivery trips for the authenticated shipper")
    @GetMapping("/trips")
    public ResponseEntity<List<DeliveryTripDTO>> getAllDeliveryTripsForShipper(Authentication authentication) {
        String username = authentication.getName();
        // TODO: Logic để lấy shipperId từ username
        // Ví dụ: Shipper shipper = shipperRepository.findByUserUsername(username).orElseThrow(...);
        // Sau đó dùng shipper.getId();
        // Hiện tại trả về tất cả, sau này cần lọc theo shipperId
        return ResponseEntity.ok(deliveryTripService.getAllDeliveryTrips());
    }

    @Operation(summary = "Update package status and upload proof of delivery")
    @PutMapping("/packages/{packageId}/status")
    public ResponseEntity<PackageDTO> updatePackageStatus(
            @PathVariable Long packageId,
            @RequestParam PackageStatus status,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) MultipartFile proofImage) {

        // Khởi tạo biến finalImageUrl, nó sẽ chỉ được gán một lần
        final String finalImageUrl; // <--- Đổi tên biến và khai báo final

        if (proofImage != null && !proofImage.isEmpty()) {
            try {
                String fileName = fileService.uploadFile(proofImage);
                // Xây dựng URL đầy đủ cho ảnh.
                // Điều này phụ thuộc vào cách bạn phục vụ file tĩnh trong Spring Boot.
                // Nếu bạn đang phục vụ từ /uploads/**, URL có thể là /files/ + fileName.
                // Hoặc nếu bạn có một domain cụ thể, hãy sử dụng nó.
                // Giả định bạn sẽ tạo một endpoint để phục vụ file tĩnh, ví dụ: "/files/{fileName}"

                // Cách 1: URL tương đối (như bạn đang dùng)
                finalImageUrl = "/api/v1/files/" + fileName;

                // Hoặc Cách 2: Fully Qualified URL (nếu bạn muốn URL đầy đủ)
                // finalImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                //         .path("/api/v1/files/")
                //         .path(fileName)
                //         .toUriString();

            } catch (IOException e) {
                e.printStackTrace();
                return ResponseEntity.status(500).build();
            }
        } else {
            finalImageUrl = null; // Gán null nếu không có ảnh, để biến là effectively final trong mọi trường hợp
        }

        PackageDTO updatedPackage = packageService.updatePackage(packageId, new PackageDTO() {{
            setStatus(status);
            setNotes(notes);
            setProofOfDeliveryUrl(finalImageUrl); // Sử dụng biến đã đảm bảo effectively final
        }});
        return ResponseEntity.ok(updatedPackage);
    }
}