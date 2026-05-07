package com.linkedu.backend.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "destinations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Destination {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String countryName;

    @Column(columnDefinition = "TEXT")
    private String description;          // Short tagline

    @Column(columnDefinition = "TEXT")
    private String paragraph;            // Full intro paragraph

    @Column(length = 500)
    private String imageUrl;             // Country flag/image

    // ── New attributes ──

    @Column(columnDefinition = "TEXT")
    private String publicUniversities;   // One per line

    @Column(columnDefinition = "TEXT")
    private String privateColleges;      // One per line

    @Column(length = 500)
    private String teachingLanguages;    // e.g. "French, English"

    @Column(columnDefinition = "TEXT")
    private String specialities;         // One per line: Computer Science, Medicine...

    @Column(length = 500)
    private String educationSystem;      // e.g. "LMD (3-5-8)", "Bachelor/Master/PhD"

    // Key numbers
    private Integer numberOfUniversities;
    private Integer numberOfStudents;     // International students
    private Integer averageTuitionFee;    // USD per year
    private Integer averageLivingCost;    // USD per month

    @Column(columnDefinition = "TEXT")
    private String offers;               // Scholarships, programs
}