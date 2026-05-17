package com.kittycare.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Recommendation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phase;     // menstrual, follicular, ovulatory, luteal

    private String title;

    @Column(length = 500)
    private String message;
}