package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"sunyi-api/internal/handlers"
	"sunyi-api/internal/middleware"
	"sunyi-api/internal/repository"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	// Load .env file (ignore error if not found - useful for production)
	_ = godotenv.Load()

	// Set Gin mode based on environment
	if getEnv("ENV", "development") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// Get database connection string
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL required (Supabase connection string)")
	}

	// Get JWT configuration
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET required")
	}
	jwtExp := getEnv("JWT_EXPIRATION", "24h")

	// Connect to database
	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	// Configure connection pool
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping database: %v", err)
	}
	log.Println("✓ Connected to database")

	// Initialize repositories
	userRepo := repository.NewUserRepository(db)
	gigRepo := repository.NewGigRepository(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret, jwtExp)
	gigHandler := handlers.NewGigHandler(gigRepo)

	// Setup Gin router
	router := gin.Default()

	// CORS configuration
	allowedOrigins := strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost:3000"), ",")
	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check endpoint
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// API v1 routes
	api := router.Group("/api")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(jwtSecret), authHandler.GetCurrentUser)
		}

		// Gigs routes
		gigs := api.Group("/gigs")
		{
			// Public routes
			gigs.GET("", gigHandler.GetAllGigs)
			gigs.GET("/:id", gigHandler.GetGigByID)
			gigs.GET("/organizer/:organizerId", gigHandler.GetGigsByOrganizer)

			// Protected routes (organizer only)
			gigs.POST("", 
				middleware.AuthMiddleware(jwtSecret), 
				middleware.OrganizerOnly(), 
				gigHandler.CreateGig,
			)
			gigs.PUT("/:id", 
				middleware.AuthMiddleware(jwtSecret), 
				middleware.OrganizerOnly(), 
				gigHandler.UpdateGig,
			)
			gigs.DELETE("/:id", 
				middleware.AuthMiddleware(jwtSecret), 
				middleware.OrganizerOnly(), 
				gigHandler.DeleteGig,
			)
		}
	}

	// Setup HTTP server
	port := getEnv("PORT", "8080")
	srv := &http.Server{
		Addr:           ":" + port,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20, // 1 MB
	}

	// Start server in a goroutine
	go func() {
		log.Printf("🚀 Server starting on port %s", port)
		log.Printf("📍 Environment: %s", getEnv("ENV", "development"))
		log.Printf("🌐 Allowed origins: %s", strings.Join(allowedOrigins, ", "))
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal for graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("🛑 Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("✓ Server exited properly")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}