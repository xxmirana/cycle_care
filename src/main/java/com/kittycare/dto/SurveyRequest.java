package com.kittycare.dto;

import lombok.Data;

@Data
public class SurveyRequest {
    private Long userId;
    private String mood;
    private String energy;
    private String symptom;
    private String notes;
}