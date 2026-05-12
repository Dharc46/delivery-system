package com.example.deliverysystem.controller;

import com.example.deliverysystem.model.Package;
import com.example.deliverysystem.service.CodReconciliationService;
import com.example.deliverysystem.dto.CodReconciliationReportDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/cod-reconciliation")
@RequiredArgsConstructor
@Tag(name = "Admin - COD Reconciliation", description = "API for Admin to manage Cash on Delivery reconciliation")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminCodReconciliationController {

    private final CodReconciliationService codReconciliationService;

    @Operation(summary = "Get packages for COD reconciliation")
    @GetMapping
    public ResponseEntity<List<Package>> getPackagesForCodReconciliation() {
        List<Package> packages = codReconciliationService.getPackagesForCodReconciliation();
        return ResponseEntity.ok(packages);
    }

    @Operation(summary = "Confirm COD reconciliation for selected packages")
    @PostMapping("/confirm")
    public ResponseEntity<String> confirmCodReconciliation(@RequestBody List<Long> packageIds, Authentication authentication) {
        String result = codReconciliationService.confirmCodReconciliation(packageIds, authentication);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "Get COD reconciliation report grouped by day, shipper, and trip")
    @GetMapping("/report")
    public ResponseEntity<CodReconciliationReportDTO> getReconciliationReport(
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate) {
        CodReconciliationReportDTO report = codReconciliationService.getReconciliationReport(fromDate, toDate);
        return ResponseEntity.ok(report);
    }
}