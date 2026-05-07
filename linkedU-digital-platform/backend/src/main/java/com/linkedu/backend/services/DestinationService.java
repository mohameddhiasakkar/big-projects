package com.linkedu.backend.services;

import com.linkedu.backend.entities.Destination;
import com.linkedu.backend.repositories.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DestinationService {
    private final DestinationRepository destinationRepository;

    public List<Destination> getAllDestinations() {
        return destinationRepository.findAll();
    }

    public Destination getDestinationById(Long id) {
        return destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found"));
    }

    public Destination createDestination(Destination destination) {
        return destinationRepository.save(destination);
    }

    public Destination updateDestination(Long id, Destination destination) {
        Destination existing = getDestinationById(id);
        existing.setCountryName(destination.getCountryName());
        existing.setDescription(destination.getDescription());
        existing.setParagraph(destination.getParagraph());
        existing.setPublicUniversities(destination.getPublicUniversities());
        existing.setPrivateColleges(destination.getPrivateColleges());
        existing.setTeachingLanguages(destination.getTeachingLanguages());
        existing.setSpecialities(destination.getSpecialities());
        existing.setEducationSystem(destination.getEducationSystem());
        existing.setNumberOfUniversities(destination.getNumberOfUniversities());
        existing.setNumberOfStudents(destination.getNumberOfStudents());
        existing.setAverageTuitionFee(destination.getAverageTuitionFee());
        existing.setAverageLivingCost(destination.getAverageLivingCost());
        existing.setOffers(destination.getOffers());
        if (destination.getImageUrl() != null) existing.setImageUrl(destination.getImageUrl());
        return destinationRepository.save(existing);
    }

    public void deleteDestination(Long id) {
        destinationRepository.deleteById(id);
    }

    public Destination getBySlug(String slug) {
        return destinationRepository.findAll().stream()
                .filter(d -> toSlug(d.getCountryName()).equals(slug))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Destination not found: " + slug));
    }

    private String toSlug(String name) {
        if (name == null) return "";
        return java.text.Normalizer.normalize(name, java.text.Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .trim()
                .toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
    }
}
