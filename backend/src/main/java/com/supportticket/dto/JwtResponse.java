package com.supportticket.dto;

import com.supportticket.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JwtResponse {
    private String token;
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String message;
}
