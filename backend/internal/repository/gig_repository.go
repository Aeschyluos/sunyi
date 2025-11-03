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
    // First, get all gigs
    var gigs []models.Gig
    query := `
        SELECT id, title, description, venue_name, venue_address,
               latitude, longitude, date, start_time, end_time,
               price, image_url, organizer_id, genres,
               created_at, updated_at
        FROM gigs
        ORDER BY date DESC, start_time DESC
    `
    err := r.db.Select(&gigs, query)
    if err != nil {
        return nil, err
    }

    // Then fetch organizer for each gig
    userQuery := `SELECT id, username, email, role, bio, profile_image, created_at, updated_at FROM users WHERE id = $1`
    for i := range gigs {
        var user models.User
        err := r.db.Get(&user, userQuery, gigs[i].OrganizerID)
        if err == nil {
            gigs[i].Organizer = &user
        }
    }

    return gigs, nil
}

func (r *GigRepository) GetByID(id string) (*models.Gig, error) {
    var gig models.Gig
    query := `
        SELECT id, title, description, venue_name, venue_address,
               latitude, longitude, date, start_time, end_time,
               price, image_url, organizer_id, genres,
               created_at, updated_at
        FROM gigs
        WHERE id = $1
    `
    err := r.db.Get(&gig, query, id)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }

    // Fetch organizer
    var user models.User
    userQuery := `SELECT id, username, email, role, bio, profile_image, created_at, updated_at FROM users WHERE id = $1`
    err = r.db.Get(&user, userQuery, gig.OrganizerID)
    if err == nil {
        gig.Organizer = &user
    }

    return &gig, nil
}

func (r *GigRepository) GetByOrganizerID(organizerID string) ([]models.Gig, error) {
    var gigs []models.Gig
    query := `
        SELECT id, title, description, venue_name, venue_address,
               latitude, longitude, date, start_time, end_time,
               price, image_url, organizer_id, genres,
               created_at, updated_at
        FROM gigs
        WHERE organizer_id = $1
        ORDER BY date DESC, start_time DESC
    `
    err := r.db.Select(&gigs, query, organizerID)
    if err != nil {
        return nil, err
    }

    // Fetch organizer for each gig
    if len(gigs) > 0 {
        var user models.User
        userQuery := `SELECT id, username, email, role, bio, profile_image, created_at, updated_at FROM users WHERE id = $1`
        err := r.db.Get(&user, userQuery, organizerID)
        if err == nil {
            for i := range gigs {
                gigs[i].Organizer = &user
            }
        }
    }

    return gigs, nil
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