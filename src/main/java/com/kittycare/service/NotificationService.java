package com.kittycare.service;

import com.kittycare.model.User;
import com.kittycare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private UserRepository userRepository;

    // Проверка каждый день в 9 утра
    @Scheduled(cron = "0 0 9 * * *")
    public void checkUpcomingPeriods() {
        List<User> users = userRepository.findAll();

        for (User user : users) {
            if (user.getLastPeriodStart() != null && user.getCycleLength() != null) {
                LocalDate nextPeriod = user.getLastPeriodStart()
                        .plusDays(user.getCycleLength());
                long daysUntil = ChronoUnit.DAYS.between(LocalDate.now(), nextPeriod);

                if (daysUntil == 1) {
                    // Здесь в реальном проекте отправлять push-уведомление
                    System.out.println("Уведомление для пользователя " + user.getUsername() +
                            ": Завтра у Китти начинаются красные деньки!");
                }
            }
        }
    }
}