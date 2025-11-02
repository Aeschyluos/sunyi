export type UserRole = "user" | "organizer";

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  bio?: string;
  profile_image?: string;
  created_at: string;
}

export interface Gig {
  id: string;
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  latitude: number;
  longitude: number;
  date: string;
  start_time: string;
  end_time?: string;
  price?: number;
  image_url?: string;
  organizer_id: string;
  organizer?: User;
  genres?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateGigInput {
  title: string;
  description: string;
  venue_name: string;
  venue_address: string;
  latitude: number;
  longitude: number;
  date: string;
  start_time: string;
  end_time?: string;
  price?: number;
  genres?: string[];
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: User;
}
