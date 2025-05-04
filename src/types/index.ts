export interface User {
  id: string;
  username: string;
  nickname: string;
  avatarUrl: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface DiaryStatus {
  status: 'pending' | 'approved' | 'rejected';
}

export interface Diary {
  id: string;
  title: string;
  content: string;
  images: string[];
  videoUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  author: {
    id: string;
    username: string;
    nickname: string;
    avatarUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDiaryData {
  title: string;
  content: string;
  images: string[];
  videoUrl?: string;
}

export interface UpdateDiaryData {
  title?: string;
  content?: string;
  images?: string[];
  videoUrl?: string;
}

export interface RejectDiaryData {
  rejectReason: string;
} 