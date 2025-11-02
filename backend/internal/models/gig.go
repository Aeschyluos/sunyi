package models

import (
    "time"
    "database/sql/driver"
    "encoding/json"
    "errors"
)

type StringArray []string

func (s *StringArray) Scan(value interface{}) error {
    if value == nil {
        *s = []string{}
        return nil
    }
    
    bytes, ok := value.([]byte)
    if !ok {
        return errors.New("failed to scan StringArray")
    }
    
    return json.Unmarshal(bytes, s)
}

func (s StringArray) Value() (driver.Value, error) {
    if len(s) == 0 {
        return nil, nil
    }
    return json.Marshal(s)
}

type Gig struct {
    ID           string       `json:"id" db:"id"`
    Title        string       `json:"title" db:"title"`
    Description  string       `json:"description" db:"description"`
    VenueName    string       `json:"venue_name" db:"venue_name"`
    VenueAddress string       `json:"venue_address" db:"venue_address"`
    Latitude     float64      `json:"latitude" db:"latitude"`
    Longitude    float64      `json:"longitude" db:"longitude"`
    Date         string       `json:"date" db:"date"`
    StartTime    string       `json:"start_time" db:"start_time"`
    EndTime      *string      `json:"end_time" db:"end_time"`
    Price        *float64     `json:"price" db:"price"`
    ImageURL     *string      `json:"image_url" db:"image_url"`
    OrganizerID  string       `json:"organizer_id" db:"organizer_id"`
    Genres       StringArray  `json:"genres" db:"genres"`
    CreatedAt    time.Time    `json:"created_at" db:"created_at"`
    UpdatedAt    time.Time    `json:"updated_at" db:"updated_at"`
    Organizer    *User        `json:"organizer,omitempty" db:"-"`
}

type CreateGigInput struct {
    Title        string    `json:"title" binding:"required"`
    Description  string    `json:"description" binding:"required"`
    VenueName    string    `json:"venue_name" binding:"required"`
    VenueAddress string    `json:"venue_address" binding:"required"`
    Latitude     float64   `json:"latitude" binding:"required,min=-90,max=90"`
    Longitude    float64   `json:"longitude" binding:"required,min=-180,max=180"`
    Date         string    `json:"date" binding:"required"`
    StartTime    string    `json:"start_time" binding:"required"`
    EndTime      *string   `json:"end_time"`
    Price        *float64  `json:"price"`
    Genres       []string  `json:"genres"`
}