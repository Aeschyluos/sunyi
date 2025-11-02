CREATE TABLE gigs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    venue_name VARCHAR(200) NOT NULL,
    venue_address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    price DECIMAL(10, 2),
    image_url TEXT,
    organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    genres JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gigs_organizer ON gigs(organizer_id);
CREATE INDEX idx_gigs_date ON gigs(date);
CREATE INDEX idx_gigs_location ON gigs(latitude, longitude);