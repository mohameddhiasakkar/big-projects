package com.linkedu.backend.controllers;

import com.linkedu.backend.entities.Destination;
import com.linkedu.backend.services.DestinationService;
import com.linkedu.backend.services.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/destinations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DestinationController {

    private final DestinationService destinationService;
    private final ImageService imageService;

    @GetMapping
    public List<Destination> getAll() {
        return destinationService.getAllDestinations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getDestinationById(id));
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Destination> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(destinationService.getBySlug(slug));
    }
}