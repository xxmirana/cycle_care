package com.kittycare.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String username;

    private String passwordHash;

    private LocalDate lastPeriodStart;

    private Integer cycleLength;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Note> notes;
}