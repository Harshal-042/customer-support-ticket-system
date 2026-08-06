package com.supportticket.service;

import com.supportticket.config.JwtUtils;
import com.supportticket.dto.JwtResponse;
import com.supportticket.dto.LoginRequest;
import com.supportticket.dto.RegisterRequest;
import com.supportticket.entity.Role;
import com.supportticket.entity.User;
import com.supportticket.exception.BadRequestException;

import com.supportticket.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    public JwtResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already registered.");
        }

        Role userRole = request.getRole() != null ? request.getRole() : Role.ROLE_CUSTOMER;

        User newUser = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(userRole)
                .build();

        userRepository.save(newUser);
        String token = jwtUtils.generateToken(newUser);

        return JwtResponse.builder()
                .token(token)
                .id(newUser.getId())
                .name(newUser.getName())
                .email(newUser.getEmail())
                .role(newUser.getRole())
                .message("User registered successfully!")
                .build();
    }

    public JwtResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password.");
        }

        String token = jwtUtils.generateToken(user);

        return JwtResponse.builder()
                .token(token)
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .message("Login successful!")
                .build();
    }
}
