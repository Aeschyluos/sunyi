package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"sunyi-api/internal/handlers"
	"sunyi-api/internal/middleware"
	"sunyi-api/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
)

func main() {    
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL required (Supabase connection string)")
	}
	jwtSecret := os.Getenv("JWT_SECRET")   // used by your auth handler
	jwtExp := os.Getenv("JWT_EXPIRATION")  // e.g. "24h" or whatever your handler expects

	// connect with sqlx (repository constructors expect *sqlx.DB)
	db, err := sqlx.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("failed to open db: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("failed to ping db: %v", err)
	}

	// create repositories
	userRepo := repository.NewUserRepository(db)
	gigRepo := repository.NewGigRepository(db)

	// create handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtSecret, jwtExp)
	gigHandler := handlers.NewGigHandler(gigRepo)

	// gin engine
	router := gin.Default() // includes Logger & Recovery

	// auth routes
	authGroup := router.Group("/api/auth")
	{
		authGroup.POST("/register", authHandler.Register)
		authGroup.POST("/login", authHandler.Login)
		// protected route for current user
		authGroup.GET("/me", middleware.AuthMiddleware(jwtSecret), authHandler.GetCurrentUser)
	}

	// gigs routes
	gigGroup := router.Group("/api/gigs")
	{
		gigGroup.GET("/", gigHandler.GetAllGigs)
		gigGroup.GET("/:id", gigHandler.GetGigByID)
		// route for organizer's gigs (if you prefer another path change accordingly)
		gigGroup.GET("/organizer/:organizer_id", gigHandler.GetGigsByOrganizer)

		// creation / modification require auth + organizer role
		gigGroup.POST("/", middleware.AuthMiddleware(jwtSecret), middleware.OrganizerOnly(), gigHandler.CreateGig)
		gigGroup.PUT("/:id", middleware.AuthMiddleware(jwtSecret), middleware.OrganizerOnly(), gigHandler.UpdateGig)
		gigGroup.DELETE("/:id", middleware.AuthMiddleware(jwtSecret), middleware.OrganizerOnly(), gigHandler.DeleteGig)
	}

	// graceful shutdown with http.Server (so Gin's handler can be used)
	srv := &http.Server{
		Addr:    ":" + getEnv("PORT", "8080"),
		Handler: router,
	}

	go func() {
		log.Printf("listening on %s", srv.Addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen: %s\n", err)
		}
	}()

	// wait for interrupt
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt)
	<-stop

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server Shutdown Failed:%+v", err)
	}
	log.Print("Server Exited Properly")
}

func getEnv(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
