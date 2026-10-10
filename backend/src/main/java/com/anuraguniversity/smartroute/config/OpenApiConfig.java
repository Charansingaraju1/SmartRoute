package com.anuraguniversity.smartroute.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .servers(List.of(
                new Server().url("http://localhost:8080/api").description("Development Server"),
                new Server().url("https://api.smartroute.anuraguniversity.edu.in/api").description("Production Server")
            ))
            .info(new Info()
                .title("SmartRoute API")
                .version("1.0.0")
                .description("Intelligent University Transportation Management System - Anurag University")
                .contact(new Contact()
                    .name("Anurag University IT Department")
                    .email("it-support@anuraguniversity.edu.in")
                    .url("https://anuraguniversity.edu.in")
                )
                .license(new License()
                    .name("Proprietary")
                    .url("https://anuraguniversity.edu.in/license")
                )
            )
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("Enter JWT token obtained from /api/auth/login")
                )
            );
    }
}