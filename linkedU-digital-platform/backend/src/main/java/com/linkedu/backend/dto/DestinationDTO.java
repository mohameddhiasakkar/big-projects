package com.linkedu.backend.dto;

import lombok.Data;

@Data
public class DestinationDTO {
    private Long id;
    private String countryName;
    private String description;
    private String paragraph;
    private String imageUrl;
    private String publicUniversities;
    private String privateColleges;
    private String teachingLanguages;
    private String specialities;
    private String educationSystem;
    private Integer numberOfUniversities;
    private Integer numberOfStudents;
    private Integer averageTuitionFee;
    private Integer averageLivingCost;
    private String offers;
}