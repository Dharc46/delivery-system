package com.example.deliverysystem.dto;

import com.example.deliverysystem.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private Long id;
    private String username;
    private String password; // <--- Thêm trường này vào UserDTO
    private Role role;
}