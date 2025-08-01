package com.example.delivery_system.service;

import com.example.delivery_system.entity.Role;
import com.example.delivery_system.config.JwtAuthenticationFilter;
import com.example.delivery_system.entity.User;
import com.example.delivery_system.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtAuthenticationFilter jwtAuthFilter;

    public String login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (passwordEncoder.matches(password, user.getPassword())) {
            return jwtAuthFilter.generateToken(username);
        }
        throw new RuntimeException("Invalid credentials");
    }

    public void register(String username, String password, String role) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.valueOf(role));
        userRepository.save(user);
    }
}