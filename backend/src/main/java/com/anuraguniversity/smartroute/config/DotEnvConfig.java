package com.anuraguniversity.smartroute.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads a local .env file (repo root or working directory) into the Spring Environment.
 * Registered via META-INF/spring.factories - Spring Boot does not invoke initializers
 * that are only declared as beans.
 */
public class DotEnvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        String userDir = System.getProperty("user.dir");
        Path localEnv = Path.of(userDir, ".env");
        Path parentEnv = Path.of(userDir).resolveSibling(".env");

        String directory;
        if (Files.exists(localEnv)) {
            directory = userDir;
        } else if (Files.exists(parentEnv) && parentEnv.getParent() != null) {
            directory = parentEnv.getParent().toString();
        } else {
            directory = userDir;
        }

        Dotenv dotenv = Dotenv.configure()
            .directory(directory)
            .ignoreIfMissing()
            .load();

        Map<String, Object> envMap = new HashMap<>();
        for (var entry : dotenv.entries()) {
            envMap.put(entry.getKey(), entry.getValue());
        }

        ConfigurableEnvironment environment = applicationContext.getEnvironment();
        environment.getPropertySources().addFirst(new MapPropertySource("dotenv", envMap));
    }
}
