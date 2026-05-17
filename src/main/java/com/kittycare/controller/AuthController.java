package com.kittycare.controller;

import com.kittycare.model.User;
import com.kittycare.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:8081")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            // Проверяем, есть ли уже такой пользователь
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent()) {
                return ResponseEntity.badRequest().body("Пользователь уже существует");
            }

            user.setPasswordHash("dummy"); // В реальном проекте нужно хешировать
            User savedUser = userRepository.save(user);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Ошибка регистрации: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password"); // Пароль пока не проверяем

        System.out.println("===== ПОПЫТКА ВХОДА =====");
        System.out.println("Ищем пользователя с именем: '" + username + "'");

        Optional<User> user = userRepository.findByUsername(username);

        if (user.isPresent()) {
            System.out.println("Пользователь НАЙДЕН в базе: " + user.get().getUsername());
            return ResponseEntity.ok(user.get());
        } else {
            System.out.println("Пользователь НЕ НАЙДЕН в базе!");
            // Возвращаем понятную ошибку
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Пользователь с именем '" + username + "' не найден");
        }
    }
}