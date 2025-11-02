package repository

import (
	"database/sql"
	"sunyi-api/internal/models"

	"github.com/jmoiron/sqlx"
)

type UserRepository struct {
    db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Create(user *models.User) error {
    query := `
        INSERT INTO users (username, email, password_hash, role, bio, profile_image)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, created_at, updated_at
    `
    return r.db.QueryRow(
        query,
        user.Username,
        user.Email,
        user.PasswordHash,
        user.Role,
        user.Bio,
        user.ProfileImage,
    ).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
    var user models.User
    query := `SELECT * FROM users WHERE id = $1`
    err := r.db.Get(&user, query, id)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &user, err
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
    var user models.User
    query := `SELECT * FROM users WHERE email = $1`
    err := r.db.Get(&user, query, email)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &user, err
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
    var user models.User
    query := `SELECT * FROM users WHERE username = $1`
    err := r.db.Get(&user, query, username)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &user, err
}

func (r *UserRepository) Update(user *models.User) error {
    query := `
        UPDATE users 
        SET username = $1, email = $2, role = $3, bio = $4, 
            profile_image = $5, updated_at = NOW()
        WHERE id = $6
        RETURNING updated_at
    `
    return r.db.QueryRow(
        query,
        user.Username,
        user.Email,
        user.Role,
        user.Bio,
        user.ProfileImage,
        user.ID,
    ).Scan(&user.UpdatedAt)
}

func (r *UserRepository) Delete(id string) error {
    query := `DELETE FROM users WHERE id = $1`
    _, err := r.db.Exec(query, id)
    return err
}

func (r *UserRepository) EmailExists(email string) (bool, error) {
    var exists bool
    query := `SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)`
    err := r.db.Get(&exists, query, email)
    return exists, err
}

func (r *UserRepository) UsernameExists(username string) (bool, error) {
    var exists bool
    query := `SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)`
    err := r.db.Get(&exists, query, username)
    return exists, err
}