package com.freshai.grocery;
// NOTE: @EnableScheduling added below for OTP cleanup job

import com.freshai.grocery.config.EnvConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GroceryApplication {
    public static void main(String[] args) {
        SpringApplication app = new SpringApplication(GroceryApplication.class);
        // EnvConfig must be registered here (not as @Component) because it listens to
        // ApplicationEnvironmentPreparedEvent — which fires BEFORE the bean context starts.
        app.addListeners(new EnvConfig());
        app.run(args);
    }
}

