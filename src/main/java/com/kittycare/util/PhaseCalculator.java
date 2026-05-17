package com.kittycare.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class PhaseCalculator {

    public static int getDayInCycle(LocalDate lastPeriod, LocalDate today) {
        long daysSince = ChronoUnit.DAYS.between(lastPeriod, today);
        return (int) (daysSince % 28) + 1; // Упрощенно
    }

    public static boolean isMenstrualPhase(int day) {
        return day <= 5;
    }

    public static boolean isFollicularPhase(int day) {
        return day > 5 && day <= 13;
    }

    public static boolean isOvulatoryPhase(int day) {
        return day > 13 && day <= 16;
    }

    public static boolean isLutealPhase(int day) {
        return day > 16;
    }
}