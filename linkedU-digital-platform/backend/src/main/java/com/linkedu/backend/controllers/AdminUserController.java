package com.linkedu.backend.controllers;

import com.linkedu.backend.entities.User;
import com.linkedu.backend.entities.enums.Role;
import com.linkedu.backend.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignRole(
            @PathVariable Long userId,
            @RequestParam String role) {
        userService.assignRole(userId, Role.valueOf(role.toUpperCase()));
        return ResponseEntity.ok(Map.of("message", "Role assigned: " + role));
    }

    @DeleteMapping("/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        return doDelete(userId);
    }

    @DeleteMapping({"/delete/{userId}", "/{userId}/delete"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserLegacyDelete(@PathVariable Long userId) {
        return doDelete(userId);
    }

    @PostMapping({"/delete/{userId}", "/{userId}/delete"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserLegacyPost(@PathVariable Long userId) {
        return doDelete(userId);
    }

    @PostMapping("/delete")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserByBody(@RequestParam Long userId) {
        return doDelete(userId);
    }

    private ResponseEntity<?> doDelete(Long userId) {
        try {
            userService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (EmptyResultDataAccessException ex) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        } catch (Exception ex) {
            return ResponseEntity.status(409).body(Map.of("error", "Cannot delete user: related data exists"));
        }
    }
}