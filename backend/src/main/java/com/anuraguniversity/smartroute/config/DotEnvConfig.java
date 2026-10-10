package com.anuraguniversity.smartroute.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class DotEnvConfig implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv dotenv = Dotenv.configure()
            .directory(System.getProperty("user.dir") + "/..")
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