package com.kittycare.service;

import com.kittycare.model.Recommendation;
import com.kittycare.repository.RecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    private final Random random = new Random();

    public Recommendation getRandomRecommendation(String phase) {
        List<Recommendation> recommendations = recommendationRepository.findByPhase(phase);
        if (recommendations.isEmpty()) {
            Recommendation defaultRec = new Recommendation();
            defaultRec.setMessage("🐱 Просто люби Китти сегодня!");
            return defaultRec;
        }

        int index = random.nextInt(recommendations.size());
        return recommendations.get(index);
    }
}