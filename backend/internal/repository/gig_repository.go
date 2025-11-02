package repository

import (
	"database/sql"
	"sunyi-api/internal/models"

	"github.com/jmoiron/sqlx"
)

type GigRepository struct {
    db *sqlx.DB
}

func NewGigRepository(db *sqlx.DB) *GigRepository {
    return &GigRepository{db: db}
}

func (r *GigRepository) Create(gig *models.Gig) error {
    query := `
        INSERT INTO gigs (
            title, description, venue_name, venue_address, 
            latitude, longitude, date, start_time, end_time, 
            price, image_url, organizer_id, genres
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id, created_at, updated_at
    `
    return r.db.QueryRow(
        query,
        gig.Title,
        gig.Description,
        gig.VenueName,
        gig.VenueAddress,
        gig.Latitude,
        gig.Longitude,
        gig.Date,
        gig.StartTime,
        gig.EndTime,
        gig.Price,
        gig.ImageURL,
        gig.OrganizerID,
        gig.Genres,
    ).Scan(&gig.ID, &gig.CreatedAt, &gig.UpdatedAt)
}

func (r *GigRepository) GetAll() ([]models.Gig, error) {
    var gigs []models.Gig
    query := `
        SELECT g.*, 
               u.id as "organizer.id",
               u.username as "organizer.username",
               u.email as "organizer.email",
               u.role as "organizer.role",
               u.bio as "organizer.bio",
               u.profile_image as "organizer.profile_image",
               u.created_at as "organizer.created_at",
               u.updated_at as "organizer.updated_at"
        FROM gigs g
        LEFT JOIN users u ON g.organizer_id = u.id
        ORDER BY g.date DESC, g.start_time DESC
    `
    err := r.db.Select(&gigs, query)
    return gigs, err
}

func (r *GigRepository) GetByID(id string) (*models.Gig, error) {
    var gig models.Gig
    query := `
        SELECT g.*, 
               u.id as "organizer.id",
               u.username as "organizer.username",
               u.email as "organizer.email",
               u.role as "organizer.role",
               u.bio as "organizer.bio",
               u.profile_image as "organizer.profile_image",
               u.created_at as "organizer.created_at",
               u.updated_at as "organizer.updated_at"
        FROM gigs g
        LEFT JOIN users u ON g.organizer_id = u.id
        WHERE g.id = $1
    `
    err := r.db.Get(&gig, query, id)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    return &gig, err
}

func (r *GigRepository) GetByOrganizerID(organizerID string) ([]models.Gig, error) {
    var gigs []models.Gig
    query := `
        SELECT g.*, 
               u.id as "organizer.id",
               u.username as "organizer.username",
               u.email as "organizer.email",
               u.role as "organizer.role",
               u.bio as "organizer.bio",
               u.profile_image as "organizer.profile_image",
               u.created_at as "organizer.created_at",
               u.updated_at as "organizer.updated_at"
        FROM gigs g
        LEFT JOIN users u ON g.organizer_id = u.id
        WHERE g.organizer_id = $1
        ORDER BY g.date DESC, g.start_time DESC
    `
    err := r.db.Select(&gigs, query, organizerID)
    return gigs, err
}

func (r *GigRepository) Update(gig *models.Gig) error {
    query := `
        UPDATE gigs 
        SET title = $1, description = $2, venue_name = $3, venue_address = $4,
            latitude = $5, longitude = $6, date = $7, start_time = $8, 
            end_time = $9, price = $10, image_url = $11, genres = $12,
            updated_at = NOW()
        WHERE id = $13
        RETURNING updated_at
    `
    return r.db.QueryRow(
        query,
        gig.Title,
        gig.Description,
        gig.VenueName,
        gig.VenueAddress,
        gig.Latitude,
        gig.Longitude,
        gig.Date,
        gig.StartTime,
        gig.EndTime,
        gig.Price,
        gig.ImageURL,
        gig.Genres,
        gig.ID,
    ).Scan(&gig.UpdatedAt)
}

func (r *GigRepository) Delete(id string) error {
    query := `DELETE FROM gigs WHERE id = $1`
    result, err := r.db.Exec(query, id)
    if err != nil {
        return err
    }
    
    rows, err := result.RowsAffected()
    if err != nil {
        return err
    }
    
    if rows == 0 {
        return sql.ErrNoRows
    }
    
    return nil
}