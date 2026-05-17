package com.kittycare.controller;

import com.kittycare.model.SurveyResponse;
import com.kittycare.repository.SurveyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Optional;

@RestController
@RequestMapping("/api/survey")
@CrossOrigin(origins = "*")
public class SurveyController {

    @Autowired
    private SurveyRepository surveyRepository;

    @PostMapping
    public SurveyResponse submitSurvey(@RequestBody SurveyResponse response) {
        if (response.getDate() == null) {
            response.setDate(LocalDate.now());
        }
        return surveyRepository.save(response);
    }

    @GetMapping("/{userId}/today")
    public ResponseEntity<SurveyResponse> getTodaySurvey(@PathVariable Long userId) {
        Optional<SurveyResponse> survey = surveyRepository
                .findByUserIdAndDate(userId, LocalDate.now());
        return survey.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{userId}/history")
    public Iterable<SurveyResponse> getSurveyHistory(@PathVariable Long userId) {
        return surveyRepository.findByUserIdOrderByDateDesc(userId);
    }
}