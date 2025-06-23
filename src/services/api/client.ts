import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:18080/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

interface User {
  id: number;
  uuid: string;
  name: string;
  email: string;
  token?: string;
}

interface RecordWithLaps {
  record: {
    id: number;
    user_id: number;
    style_id: number;
    distance_id: number;
    date: string;
    is_short_course: boolean;
    memo: string;
    created_at: string;
    updated_at: string;
  };
  laps: {
    record_id: number;
    lap_number: number;
    lap_time: string;
    created_at: string;
    updated_at: string;
  }[];
}

interface CreateRecordRequest {
  style_id: number;
  distance_id: number;
  date: string;
  is_short_course: boolean;
  memo: string;
  lap_times: string[];
}

export const api = {
  // ユーザー関連
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'ユーザー一覧の取得に失敗しました' };
    }
  },

  async getUser(id: number): Promise<ApiResponse<User>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'ユーザー情報の取得に失敗しました' };
    }
  },

  async createUser(userData: { name: string; email: string; password: string }): Promise<ApiResponse<User>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, userData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'ユーザーの作成に失敗しました' };
    }
  },

  async updateUser(id: number, userData: { name: string; email: string }): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${id}`, userData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'ユーザーの更新に失敗しました' };
    }
  },

  async updateUserByUUID(uuid: string, userData: { name: string; email: string }): Promise<ApiResponse<User>> {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/uuid/${uuid}`, userData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'ユーザーの更新に失敗しました' };
    }
  },

  async deleteUser(id: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete(`${API_BASE_URL}/users/${id}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: 'ユーザーの削除に失敗しました' };
    }
  },

  // 認証関連
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/login`, { email, password });
      return { data: response.data.user, error: null };
    } catch (error) {
      return { data: null, error: 'ログインに失敗しました' };
    }
  },

  async logout(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/logout`);
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  },

  async getRecordsByUser(userId: number): Promise<ApiResponse<RecordWithLaps[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/records/user/${userId}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: '記録の取得に失敗しました' };
    }
  },

  async getRecordsByUserUUID(userUUID: string): Promise<ApiResponse<RecordWithLaps[]>> {
    try {
      const response = await axios.get(`${API_BASE_URL}/records/user/uuid/${userUUID}`);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: '記録の取得に失敗しました' };
    }
  },

  async createRecord(userId: number, recordData: CreateRecordRequest): Promise<ApiResponse<RecordWithLaps>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/records/user/${userId}`, recordData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: '記録の作成に失敗しました' };
    }
  },

  async createRecordByUserUUID(userUUID: string, recordData: CreateRecordRequest): Promise<ApiResponse<RecordWithLaps>> {
    try {
      const response = await axios.post(`${API_BASE_URL}/records/user/uuid/${userUUID}`, recordData);
      return { data: response.data, error: null };
    } catch (error) {
      return { data: null, error: '記録の作成に失敗しました' };
    }
  },

  async uploadOcrImage(file: File): Promise<{ values: string[] }> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
}; 