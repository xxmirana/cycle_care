package com.kittycare;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HelloKittyApplication {
    public static void main(String[] args) {
        SpringApplication.run(HelloKittyApplication.class, args);
    }
}