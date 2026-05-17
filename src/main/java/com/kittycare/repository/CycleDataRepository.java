package com.kittycare.repository;

import com.kittycare.model.CycleData;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CycleDataRepository extends JpaRepository<CycleData, Long> {
    List<CycleData> findByUserIdOrderByStartDateDesc(Long userId);
}