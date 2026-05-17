package com.kittycare.service;

import com.kittycare.dto.CyclePhaseDTO;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class CycleService {

    public CyclePhaseDTO getPhase(LocalDate lastPeriod, int cycleLength, LocalDate today) {
        long daysSince = ChronoUnit.DAYS.between(lastPeriod, today);
        int dayInCycle = (int)(daysSince % cycleLength) + 1;
        if (dayInCycle <= 0) dayInCycle += cycleLength;

        String phase;
        String mood;
        String weather;

        if (dayInCycle <= 5) {
            phase = "menstrual";
            mood = "sad";
            weather = "rain";
        } else if (dayInCycle <= 13) {
            phase = "follicular";
            mood = "happy";
            weather = "sunny";
        } else if (dayInCycle <= 16) {
            phase = "ovulatory";
            mood = "playful";
            weather = "sunny";
        } else {
            phase = "luteal";
            mood = "irritated";
            weather = "cloudy";
        }

        LocalDate nextPeriod = lastPeriod.plusDays(cycleLength);

        CyclePhaseDTO dto = new CyclePhaseDTO();
        dto.setPhase(phase);
        dto.setCurrentDay(dayInCycle);
        dto.setCycleLength(cycleLength);
        dto.setMood(mood);
        dto.setWeather(weather);
        dto.setNextPeriodDate(nextPeriod);

        return dto;
    }
}