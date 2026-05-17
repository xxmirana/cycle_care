package com.kittycare.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Entity
@Data
public class SurveyResponse {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private LocalDate date;

    private String mood;      // happy, sad, irritated

    private String energy;    // high, low

    private String symptom;   // none, cramps, headache

    private String notes;     // дополнительные заметки
}