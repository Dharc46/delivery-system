package com.example.delivery_system.controller;

import com.example.delivery_system.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @Operation(summary = "Login", description = "Authenticate user and return JWT token")
    @ApiResponse(responseCode = "200", description = "JWT token returned")
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String username, @RequestParam String password) {
        return ResponseEntity.ok(authService.login(username, password));
    }

    @Operation(summary = "Register", description = "Register a new user")
    @ApiResponse(responseCode = "200", description = "User registered successfully")
    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestParam String username, @RequestParam String password, @RequestParam String role) {
        authService.register(username, password, role);
        return ResponseEntity.ok().build();
    }
}