package com.auditiq.service;

import com.auditiq.dto.request.LoginRequest;
import com.auditiq.dto.request.RegisterRequest;
import com.auditiq.dto.response.AuthResponse;
import com.auditiq.model.Company;
import com.auditiq.model.User;
import com.auditiq.repository.CompanyRepository;
import com.auditiq.repository.UserRepository;
import com.auditiq.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    /**
     * Registers a new user.
     * Hashes their password and saves to DB. Returns a JWT token.
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already taken.");
        }

        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId())
                    .orElseThrow(() -> new IllegalArgumentException("Company not found."));
        } else if (request.getNewCompanyName() != null && !request.getNewCompanyName().trim().isEmpty()) {
            final String companyNameTrimmed = request.getNewCompanyName().trim();
            company = companyRepository.findByName(companyNameTrimmed)
                    .orElseGet(() -> companyRepository.save(
                            Company.builder()
                                    .name(companyNameTrimmed)
                                    .build()
                    ));
        } else if ("organization".equalsIgnoreCase(request.getRole())) {
            throw new IllegalArgumentException("Company selection or a new company name is required for organization registration.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // HASH password
                .role(request.getRole().toLowerCase()) // e.g. "auditor" or "organization"
                .company(company)
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }

    /**
     * Authenticates a user.
     * Checks password, generates a new JWT token.
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate the user (Spring Security handles checking the hashed password)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // If we reach here, credentials are correct. Load user and generate token.
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));
                
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String jwtToken = jwtUtil.generateToken(userDetails);

        return AuthResponse.builder()
                .token(jwtToken)
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .build();
    }
}
