package com.kittycare.controller;

import com.kittycare.dto.CyclePhaseDTO;
import com.kittycare.model.CycleData;
import com.kittycare.model.User;
import com.kittycare.repository.CycleDataRepository;
import com.kittycare.repository.UserRepository;
import com.kittycare.service.CycleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cycle")
@CrossOrigin(origins = "*")
public class CycleController {

    @Autowired
    private CycleService cycleService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CycleDataRepository cycleDataRepository;

    @PostMapping("/start")
    public ResponseEntity<?> setLastPeriod(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam int length) {

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body("Пользователь не найден");
        }

        user.setLastPeriodStart(date);
        user.setCycleLength(length);
        userRepository.save(user);

        // Сохраняем в историю
        CycleData cycleData = new CycleData();
        cycleData.setUserId(userId);
        cycleData.setStartDate(date);
        cycleData.setLength(length);
        cycleDataRepository.save(cycleData);

        return ResponseEntity.ok(Map.of("message", "Данные сохранены"));
    }

    @GetMapping("/phase/{userId}")
    public ResponseEntity<CyclePhaseDTO> getCurrentPhase(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getLastPeriodStart() == null) {
            return ResponseEntity.badRequest().build();
        }

        CyclePhaseDTO phase = cycleService.getPhase(
                user.getLastPeriodStart(),
                user.getCycleLength(),
                LocalDate.now()
        );

        return ResponseEntity.ok(phase);
    }

    @PostMapping("/mark")
    public ResponseEntity<?> markDay(
            @RequestParam Long userId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String type,
            @RequestParam(required = false) String details) {

        // type: "period", "sex_protected", "sex_unprotected"
        // В реальном проекте сохранять в отдельную таблицу

        String message = "";
        if (type.equals("period")) {
            message = "Отмечен день менструации";
        } else if (type.startsWith("sex")) {
            message = "Отмечен день близости";
        }

        return ResponseEntity.ok(Map.of("message", message));
    }

    @GetMapping("/history/{userId}")
    public List<CycleData> getCycleHistory(@PathVariable Long userId) {
        return cycleDataRepository.findByUserIdOrderByStartDateDesc(userId);
    }
}