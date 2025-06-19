export interface SwimLog {
  id: string;
  date: string;
  distance: number;
  duration: number;
  style: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
} 