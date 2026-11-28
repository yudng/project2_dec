package com.jackoup.inventory.config;

import com.jackoup.inventory.model.AppUser;
import com.jackoup.inventory.model.Role;
import com.jackoup.inventory.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner seedUsers(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByUsernameIgnoreCase("admin")) {
                userRepository.save(new AppUser(
                        "admin",
                        passwordEncoder.encode("admin123"),
                        "Warehouse Administrator",
                        Role.ADMIN));
            }
            if (!userRepository.existsByUsernameIgnoreCase("staff")) {
                userRepository.save(new AppUser(
                        "staff",
                        passwordEncoder.encode("staff123"),
                        "Inventory Staff",
                        Role.STAFF));
            }
        };
    }
}
