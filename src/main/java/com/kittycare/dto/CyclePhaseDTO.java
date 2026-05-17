package com.kittycare.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class CyclePhaseDTO {
    private String phase;      // menstrual, follicular, ovulatory, luteal
    private int currentDay;
    private int cycleLength;
    private String mood;       // happy, sad, playful, irritated
    private String weather;    // rain, sunny, cloudy
    private LocalDate nextPeriodDate;
}