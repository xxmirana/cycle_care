package com.kittycare.controller;

import com.kittycare.model.Recommendation;
import com.kittycare.model.User;
import com.kittycare.repository.RecommendationRepository;
import com.kittycare.repository.UserRepository;
import com.kittycare.service.CycleService;
import com.kittycare.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CycleService cycleService;

    @GetMapping("/{userId}")
    public ResponseEntity<Recommendation> getRecommendation(@PathVariable Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getLastPeriodStart() == null) {
            return ResponseEntity.ok(getDefaultRecommendation());
        }

        String phase = cycleService.getPhase(
                user.getLastPeriodStart(),
                user.getCycleLength(),
                LocalDate.now()
        ).getPhase();

        Recommendation rec = recommendationService.getRandomRecommendation(phase);
        return ResponseEntity.ok(rec);
    }

    private Recommendation getDefaultRecommendation() {
        Recommendation rec = new Recommendation();
        rec.setMessage("🐱 Введи данные о цикле, и я скажу, как заботиться о Китти!");
        return rec;
    }
}