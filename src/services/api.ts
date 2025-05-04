import axios from 'axios';
import { 
  LoginData, 
  LoginResponse, 
  CreateDiaryData, 
  UpdateDiaryData, 
  Diary, 
  PaginatedResponse,
  RejectDiaryData,
  User
} from '../types';

const baseURL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
});

// 请求拦截器添加令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 认证相关API
export const authAPI = {
  login: (data: LoginData): Promise<LoginResponse> => 
    api.post('/users/login', data).then(res => res.data),
    
  register: (formData: FormData): Promise<LoginResponse> => 
    api.post('/users/register', formData).then(res => res.data),
    
  getUserProfile: (): Promise<User> => 
    api.get('/users/profile').then(res => res.data),
    
  updateAvatar: (avatarUrl: string) => 
    api.put('/users/avatar', { avatarUrl }).then(res => res.data),
    
  updateNickname: (nickname: string) => 
    api.put('/users/nickname', { nickname }).then(res => res.data),
};

// 游记相关API
export const diaryAPI = {
  createDiary: (data: CreateDiaryData): Promise<Diary> => 
    api.post('/diaries', data).then(res => res.data),
    
  updateDiary: (id: string, data: UpdateDiaryData): Promise<Diary> => 
    api.put(`/diaries/${id}`, data).then(res => res.data),
    
  deleteDiary: (id: string) => 
    api.delete(`/diaries/${id}`).then(res => res.data),
    
  getDiaryById: (id: string): Promise<Diary> => 
    api.get(`/diaries/${id}`).then(res => res.data),
    
  getPublicDiaries: (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Diary>> => 
    api.get('/diaries', { params }).then(res => res.data),
    
  getUserDiaries: (params?: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected' }): Promise<PaginatedResponse<Diary>> => 
    api.get('/diaries/user/me', { params }).then(res => res.data),
};

// 管理员相关API
export const adminAPI = {
  getPendingDiaries: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Diary>> => 
    api.get('/admin/diaries/pending', { params }).then(res => res.data),
    
  approveDiary: (id: string): Promise<Diary> => 
    api.put(`/admin/diaries/${id}/approve`).then(res => res.data),
    
  rejectDiary: (id: string, data: RejectDiaryData): Promise<Diary> => 
    api.put(`/admin/diaries/${id}/reject`, data).then(res => res.data),
    
  deleteDiary: (id: string) => 
    api.delete(`/admin/diaries/${id}`).then(res => res.data),
};

// 文件上传API
export const uploadAPI = {
  uploadFile: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData).then(res => res.data);
  },
};

export default api; 