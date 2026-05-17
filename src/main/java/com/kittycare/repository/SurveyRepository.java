package com.kittycare.repository;

import com.kittycare.model.SurveyResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SurveyRepository extends JpaRepository<SurveyResponse, Long> {
    Optional<SurveyResponse> findByUserIdAndDate(Long userId, LocalDate date);
    List<SurveyResponse> findByUserIdOrderByDateDesc(Long userId);
}