@echo off
setlocal
rem Flyway migration helper. Credentials come from the environment - never hardcode them here.
rem Set FLYWAY_USER / FLYWAY_PASSWORD (or DB_USERNAME / DB_PASSWORD) before running.

if "%FLYWAY_URL%"=="" set "FLYWAY_URL=jdbc:mysql://localhost:3306/smartroute?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC"
if "%FLYWAY_USER%"=="" if not "%DB_USERNAME%"=="" set "FLYWAY_USER=%DB_USERNAME%"
if "%FLYWAY_PASSWORD%"=="" if not "%DB_PASSWORD%"=="" set "FLYWAY_PASSWORD=%DB_PASSWORD%"

if "%FLYWAY_USER%"=="" (
    echo Error: FLYWAY_USER ^(or DB_USERNAME^) is not set. Copy .env.example to .env and export the values, or set them in the environment.
    exit /b 1
)
if "%FLYWAY_PASSWORD%"=="" (
    echo Error: FLYWAY_PASSWORD ^(or DB_PASSWORD^) is not set. Never commit credentials to this file.
    exit /b 1
)

mvn flyway:migrate -Dflyway.url="%FLYWAY_URL%" -Dflyway.user="%FLYWAY_USER%" -Dflyway.password="%FLYWAY_PASSWORD%"
endlocal
