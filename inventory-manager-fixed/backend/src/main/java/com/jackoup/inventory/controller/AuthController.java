package com.jackoup.inventory.controller;

import com.jackoup.inventory.dto.LoginRequest;
import com.jackoup.inventory.dto.LoginResponse;
import com.jackoup.inventory.dto.UserProfileResponse;
import com.jackoup.inventory.model.AppUser;
import com.jackoup.inventory.repository.UserRepository;
import com.jackoup.inventory.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "JWT login and user session endpoints")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthController(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate with username and password to obtain a JWT token")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username().trim(), request.password()));

        AppUser user = userRepository.findByUsernameIgnoreCase(request.username().trim())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        String token = jwtService.generateToken(user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getUsername(), user.getFullName(), user.getRole());
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public UserProfileResponse me(Authentication authentication) {
        AppUser user = userRepository.findByUsernameIgnoreCase(authentication.getName())
                .orElseThrow(() -> new BadCredentialsException("User session is no longer valid"));
        return new UserProfileResponse(user.getUsername(), user.getFullName(), user.getRole());
    }
}
