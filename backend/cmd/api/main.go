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
	_ = godotenv.Load()

	if getEnv("ENV", "development") == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL required")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Fatal("JWT_SECRET required")
	}
	jwtExp := getEnv("JWT_EXPIRATION", "24h")

	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("failed to open database: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to get database: %v", err)
	}
	log.Println("Connected to database")

	userRepo := repository.NewUserRepository(db)
	gigRepo := repository.NewGigRepository(db)

	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret, jwtExp)
	gigHandler := handlers.NewGigHandler(gigRepo)

	router := gin.Default()

	allowedOrigins := strings.Split(getEnv("ALLOWED_ORIGINS", "http://localhost:3000"), ",")
	router.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	api := router.Group("/api")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.GET("/me", middleware.AuthMiddleware(jwtSecret), authHandler.GetCurrentUser)
		}

		gigs := api.Group("/gigs")
		{
			gigs.GET("", gigHandler.GetAllGigs)
			gigs.GET("/:id", gigHandler.GetGigByID)
			gigs.GET("/organizer/:organizerId", gigHandler.GetGigsByOrganizer)

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

	port := getEnv("PORT", "8080")
	srv := &http.Server{
		Addr:           ":" + port,
		Handler:        router,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		IdleTimeout:    60 * time.Second,
		MaxHeaderBytes: 1 << 20, // that's 1 mb
	}

	go func() {
		log.Printf("Port: %s", port)
		
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Server stopping. . .")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to stop: %v", err)
	}

	log.Println("Server exited correctly")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}