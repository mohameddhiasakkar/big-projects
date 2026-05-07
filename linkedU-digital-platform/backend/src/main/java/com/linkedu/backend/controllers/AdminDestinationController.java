package com.linkedu.backend.controllers;

import com.linkedu.backend.entities.Destination;
import com.linkedu.backend.services.DestinationService;
import com.linkedu.backend.services.ImageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/destinations")
@RequiredArgsConstructor
public class AdminDestinationController {

    private final DestinationService destinationService;
    private final ImageService imageService;
    //private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<Destination>> getAll() {
        return ResponseEntity.ok(destinationService.getAllDestinations());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Destination> getOne(@PathVariable Long id) {
        return ResponseEntity.ok(destinationService.getDestinationById(id));
    }

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<?> create(
            @RequestParam String countryName,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String paragraph,
            @RequestParam(required = false) String publicUniversities,
            @RequestParam(required = false) String privateColleges,
            @RequestParam(required = false) String teachingLanguages,
            @RequestParam(required = false) String specialities,
            @RequestParam(required = false) String educationSystem,
            @RequestParam(required = false) Integer numberOfUniversities,
            @RequestParam(required = false) Integer numberOfStudents,
            @RequestParam(required = false) Integer averageTuitionFee,
            @RequestParam(required = false) Integer averageLivingCost,
            @RequestParam(required = false) String offers,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            Destination dest = new Destination();
            dest.setCountryName(countryName);
            dest.setDescription(description);
            dest.setParagraph(paragraph);
            dest.setPublicUniversities(publicUniversities);
            dest.setPrivateColleges(privateColleges);
            dest.setTeachingLanguages(teachingLanguages);
            dest.setSpecialities(specialities);
            dest.setEducationSystem(educationSystem);
            dest.setNumberOfUniversities(numberOfUniversities);
            dest.setNumberOfStudents(numberOfStudents);
            dest.setAverageTuitionFee(averageTuitionFee);
            dest.setAverageLivingCost(averageLivingCost);
            dest.setOffers(offers);

            if (image != null && !image.isEmpty()) {
                dest.setImageUrl(imageService.saveImage(image));
            }

            Destination saved = destinationService.createDestination(dest);
            return ResponseEntity.ok(Map.of(
                    "id", saved.getId(),
                    "message", "Destination created successfully"
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    @PutMapping(value = "/{id}", consumes = "multipart/form-data")
    public ResponseEntity<?> update(
            @PathVariable Long id,
            @RequestParam String countryName,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String paragraph,
            @RequestParam(required = false) String publicUniversities,
            @RequestParam(required = false) String privateColleges,
            @RequestParam(required = false) String teachingLanguages,
            @RequestParam(required = false) String specialities,
            @RequestParam(required = false) String educationSystem,
            @RequestParam(required = false) Integer numberOfUniversities,
            @RequestParam(required = false) Integer numberOfStudents,
            @RequestParam(required = false) Integer averageTuitionFee,
            @RequestParam(required = false) Integer averageLivingCost,
            @RequestParam(required = false) String offers,
            @RequestParam(required = false) MultipartFile image
    ) {
        try {
            Destination dest = new Destination();
            dest.setCountryName(countryName);
            dest.setDescription(description);
            dest.setParagraph(paragraph);
            dest.setPublicUniversities(publicUniversities);
            dest.setPrivateColleges(privateColleges);
            dest.setTeachingLanguages(teachingLanguages);
            dest.setSpecialities(specialities);
            dest.setEducationSystem(educationSystem);
            dest.setNumberOfUniversities(numberOfUniversities);
            dest.setNumberOfStudents(numberOfStudents);
            dest.setAverageTuitionFee(averageTuitionFee);
            dest.setAverageLivingCost(averageLivingCost);
            dest.setOffers(offers);

            if (image != null && !image.isEmpty()) {
                dest.setImageUrl(imageService.saveImage(image));
            }

            Destination updated = destinationService.updateDestination(id, dest);
            return ResponseEntity.ok(Map.of(
                    "id", updated.getId(),
                    "message", "Destination updated successfully"
            ));
        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        destinationService.deleteDestination(id);
        return ResponseEntity.ok(Map.of("message", "Destination deleted"));
    }
}