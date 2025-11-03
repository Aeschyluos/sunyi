package handlers

import (
	"net/http"
	"sunyi-api/internal/middleware"
	"sunyi-api/internal/models"
	"sunyi-api/internal/repository"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
    userRepo  *repository.UserRepository
    jwtSecret string
    jwtExp    string
}

func NewAuthHandler(userRepo *repository.UserRepository, jwtSecret, jwtExp string) *AuthHandler {
    return &AuthHandler{
        userRepo:  userRepo,
        jwtSecret: jwtSecret,
        jwtExp:    jwtExp,
    }
}

func (h *AuthHandler) Register(c *gin.Context) {
    var input models.RegisterInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Check if email already exists
    exists, err := h.userRepo.EmailExists(input.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check email"})
        return
    }
    if exists {
        c.JSON(http.StatusConflict, gin.H{"error": "Email already registered"})
        return
    }

    // Check if username already exists
    exists, err = h.userRepo.UsernameExists(input.Username)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username"})
        return
    }
    if exists {
        c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
        return
    }

    // Hash password
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    // Create user
    user := &models.User{
        Username:     input.Username,
        Email:        input.Email,
        PasswordHash: string(hashedPassword),
        Role:         input.Role,
    }

    if err := h.userRepo.Create(user); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
        return
    }

    // Generate JWT token
    token, err := h.generateToken(user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    c.JSON(http.StatusCreated, models.AuthResponse{
        Token: token,
        User:  *user,
    })
}

func (h *AuthHandler) Login(c *gin.Context) {
    var input models.LoginInput
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    // Get user by email
    user, err := h.userRepo.GetByEmail(input.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
        return
    }
    if user == nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Check password
    if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(input.Password)); err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
        return
    }

    // Generate JWT token
    token, err := h.generateToken(user)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
        return
    }

    c.JSON(http.StatusOK, models.AuthResponse{
        Token: token,
        User:  *user,
    })
}

func (h *AuthHandler) GetCurrentUser(c *gin.Context) {
    userID, exists := c.Get("user_id")
    if !exists {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "User not authenticated"})
        return
    }

    user, err := h.userRepo.GetByID(userID.(string))
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
        return
    }
    if user == nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }

    c.JSON(http.StatusOK, user)
}

func (h *AuthHandler) generateToken(user *models.User) (string, error) {
    expirationTime, _ := time.ParseDuration(h.jwtExp)
    
    claims := &middleware.Claims{
        UserID: user.ID,
        Email:  user.Email,
        Role:   user.Role,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(expirationTime)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(h.jwtSecret))
}