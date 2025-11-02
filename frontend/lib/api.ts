import axios from "axios";
import type {
  User,
  Gig,
  CreateGigInput,
  LoginInput,
  RegisterInput,
  AuthResponse,
} from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/register", data);
    return response.data;
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post("/api/auth/login", data);
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get("/api/auth/me");
    return response.data;
  },
};

// Gigs API
export const gigsAPI = {
  getAll: async (): Promise<Gig[]> => {
    const response = await api.get("/api/gigs");
    return response.data;
  },

  getById: async (id: string): Promise<Gig> => {
    const response = await api.get(`/api/gigs/${id}`);
    return response.data;
  },

  create: async (data: CreateGigInput): Promise<Gig> => {
    const response = await api.post("/api/gigs", data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateGigInput>): Promise<Gig> => {
    const response = await api.put(`/api/gigs/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/gigs/${id}`);
  },

  getByOrganizer: async (organizerId: string): Promise<Gig[]> => {
    const response = await api.get(`/api/gigs/organizer/${organizerId}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/api/users/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/api/users/${id}`, data);
    return response.data;
  },
};

export default api;
