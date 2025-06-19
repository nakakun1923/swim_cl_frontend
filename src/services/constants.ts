export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18080/api';

export const ROUTES = {
  LOGIN: '/login',
  USERS: '/users',
  USER_NEW: '/users/new',
  USER_EDIT: '/users/edit/:id',
} as const; 