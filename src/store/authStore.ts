import { create } from 'zustand';
import { User, LoginData } from '../types';
import { authAPI } from '../services/api';
import { jwtDecode } from 'jwt-decode';

interface AuthState {
  isLoggedIn: boolean;
  userInfo: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  updateProfile: (user: Partial<User>) => void;
  checkAuth: () => Promise<boolean>;
}

// 检查本地存储中的令牌是否有效
const isTokenValid = (token: string): boolean => {
  try {
    const decoded: any = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  userInfo: null,
  token: null,
  error: null,
  loading: false,
  
  login: async (data: LoginData) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login(data);
      localStorage.setItem('token', response.token);
      set({ 
        isLoggedIn: true, 
        userInfo: response.user, 
        token: response.token,
        loading: false
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || '登录失败', 
        loading: false 
      });
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ 
      isLoggedIn: false, 
      userInfo: null, 
      token: null 
    });
  },
  
  updateProfile: (user: Partial<User>) => {
    const currentUser = get().userInfo;
    if (currentUser) {
      set({ 
        userInfo: { ...currentUser, ...user } 
      });
    }
  },
  
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (token && isTokenValid(token)) {
      set({ token, loading: true });
      try {
        const user = await authAPI.getUserProfile();
        set({ 
          isLoggedIn: true, 
          userInfo: user, 
          loading: false 
        });
        return true;
      } catch (error) {
        localStorage.removeItem('token');
        set({ 
          isLoggedIn: false, 
          userInfo: null, 
          token: null, 
          loading: false 
        });
        return false;
      }
    }
    return false;
  }
})); 