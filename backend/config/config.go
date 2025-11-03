package config

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
    Server   ServerConfig
    Database DatabaseConfig
    JWT      JWTConfig
    CORS     CORSConfig
}

type ServerConfig struct {
    Port string
    Env  string
}

type DatabaseConfig struct {
    Host     string
    Port     string
    User     string
    Password string
    DBName   string
    SSLMode  string
}

type JWTConfig struct {
    Secret     string
    Expiration string
}

type CORSConfig struct {
    AllowedOrigins []string
}

func Load() (*Config, error) {
    // Load .env file if it exists
    _ = godotenv.Load()

    config := &Config{
        Server: ServerConfig{
            Port: getEnv("PORT", "8080"),
            Env:  getEnv("ENV", "development"),
        },
        Database: DatabaseConfig{
            Host:     getEnv("DB_HOST", "localhost"),
            Port:     getEnv("DB_PORT", "5432"),
            User:     getEnv("DB_USER", "postgres"),
            Password: getEnv("DB_PASSWORD", ""),
            DBName:   getEnv("DB_NAME", "sunyi_db"),
            SSLMode:  getEnv("DB_SSLMODE", "disable"),
        },
        JWT: JWTConfig{
            Secret:     getEnv("JWT_SECRET", ""),
            Expiration: getEnv("JWT_EXPIRATION", "24h"),
        },
        CORS: CORSConfig{
            AllowedOrigins: []string{
                getEnv("ALLOWED_ORIGINS", "http://localhost:3000"),
            },
        },
    }

    // Validate required fields
    if config.Database.Password == "" {
        return nil, fmt.Errorf("DB_PASSWORD is required")
    }
    if config.JWT.Secret == "" {
        return nil, fmt.Errorf("JWT_SECRET is required")
    }

    return config, nil
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}