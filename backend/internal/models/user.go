package models

import "time"

type UserRole string

const (
    RoleUser      UserRole = "user"
    RoleOrganizer UserRole = "organizer"
)

type User struct {
    ID           string     `json:"id" db:"id"`
    Username     string     `json:"username" db:"username"`
    Email        string     `json:"email" db:"email"`
    PasswordHash string     `json:"-" db:"password_hash"`
    Role         UserRole   `json:"role" db:"role"`
    Bio          *string    `json:"bio" db:"bio"`
    ProfileImage *string    `json:"profile_image" db:"profile_image"`
    CreatedAt    time.Time  `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

type RegisterInput struct {
    Username string   `json:"username" binding:"required,min=3,max=50"`
    Email    string   `json:"email" binding:"required,email"`
    Password string   `json:"password" binding:"required,min=8"`
    Role     UserRole `json:"role" binding:"required,oneof=user organizer"`
}

type LoginInput struct {
    Email    string `json:"email" binding:"required,email"`
    Password string `json:"password" binding:"required"`
}

type AuthResponse struct {
    Token string `json:"token"`
    User  User   `json:"user"`
}

func (u *User) IsOrganizer() bool {
    return u.Role == RoleOrganizer
}