# Multi-stage Docker build for SmartRoute Spring Boot Backend (Java 21)
# ==============================================================================
# Build Stage
# ==============================================================================
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B || true

# Build application artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# ==============================================================================
# Runtime Stage
# ==============================================================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

LABEL maintainer="Anurag University Transport Management"
LABEL description="SmartRoute Backend Service (Spring Boot 4.1.1, Java 21)"

# Create non-root system user for security compliance
RUN addgroup -S smartroute && adduser -S smartroute -G smartroute

# Copy built executable JAR from build stage
COPY --from=build /app/target/smartroute-backend-1.0.0-SNAPSHOT.jar app.jar

# Set ownership to non-root user
RUN chown -R smartroute:smartroute /app

USER smartroute

ENV PORT=8080
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# Container healthcheck using Alpine's built-in wget
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/api/actuator/health || exit 1

# Execute Java with exec to allow proper Unix signal forwarding (SIGTERM / graceful shutdown)
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar app.jar"]
