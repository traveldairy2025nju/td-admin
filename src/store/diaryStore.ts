import { create } from 'zustand';
import { Diary, PaginatedResponse, CreateDiaryData, UpdateDiaryData, RejectDiaryData } from '../types';
import { diaryAPI, adminAPI } from '../services/api';

interface DiaryState {
  // 公开已批准的游记列表
  publicDiaries: Diary[];
  publicDiariesLoading: boolean;
  publicDiariesError: string | null;
  publicDiariesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // 当前用户的游记列表
  userDiaries: Diary[];
  userDiariesLoading: boolean;
  userDiariesError: string | null;
  userDiariesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // 待审核游记列表（管理员）
  pendingDiaries: Diary[];
  pendingDiariesLoading: boolean;
  pendingDiariesError: string | null;
  pendingDiariesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // 已拒绝游记列表（管理员）
  rejectedDiaries: Diary[];
  rejectedDiariesLoading: boolean;
  rejectedDiariesError: string | null;
  rejectedDiariesPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  
  // 当前选中的游记
  currentDiary: Diary | null;
  currentDiaryLoading: boolean;
  currentDiaryError: string | null;
  
  // 操作状态
  operationLoading: boolean;
  operationError: string | null;
  
  // 方法
  fetchPublicDiaries: (params?: { page?: number; limit?: number; keyword?: string }) => Promise<void>;
  fetchUserDiaries: (params?: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected' }) => Promise<void>;
  fetchPendingDiaries: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchRejectedDiaries: (params?: { page?: number; limit?: number; keyword?: string }) => Promise<void>;
  fetchDiaryById: (id: string) => Promise<Diary>;
  createDiary: (data: CreateDiaryData) => Promise<Diary>;
  updateDiary: (id: string, data: UpdateDiaryData) => Promise<Diary>;
  deleteDiary: (id: string) => Promise<void>;
  approveDiary: (id: string) => Promise<Diary>;
  rejectDiary: (id: string, data: RejectDiaryData) => Promise<Diary>;
  adminDeleteDiary: (id: string) => Promise<void>;
}

export const useDiaryStore = create<DiaryState>((set, get) => ({
  // 初始状态
  publicDiaries: [],
  publicDiariesLoading: false,
  publicDiariesError: null,
  publicDiariesPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  
  userDiaries: [],
  userDiariesLoading: false,
  userDiariesError: null,
  userDiariesPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  
  pendingDiaries: [],
  pendingDiariesLoading: false,
  pendingDiariesError: null,
  pendingDiariesPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  
  rejectedDiaries: [],
  rejectedDiariesLoading: false,
  rejectedDiariesError: null,
  rejectedDiariesPagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  
  currentDiary: null,
  currentDiaryLoading: false,
  currentDiaryError: null,
  
  operationLoading: false,
  operationError: null,
  
  // 方法实现
  fetchPublicDiaries: async (params = { page: 1, limit: 10 }) => {
    console.log('开始获取已审核游记, 参数:', params);
    set({ publicDiariesLoading: true, publicDiariesError: null });
    try {
      const response = await diaryAPI.getPublicDiaries(params);
      console.log('获取已审核游记成功, 数据:', response.items.length, '条');
      set({ 
        publicDiaries: response.items,
        publicDiariesPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        publicDiariesLoading: false,
      });
    } catch (error: any) {
      console.error('获取已审核游记失败:', error);
      set({ 
        publicDiariesError: error.response?.data?.message || '获取游记列表失败',
        publicDiariesLoading: false,
      });
    }
  },
  
  fetchUserDiaries: async (params = { page: 1, limit: 10 }) => {
    set({ userDiariesLoading: true, userDiariesError: null });
    try {
      const response = await diaryAPI.getUserDiaries(params);
      set({ 
        userDiaries: response.items,
        userDiariesPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        userDiariesLoading: false,
      });
    } catch (error: any) {
      set({ 
        userDiariesError: error.response?.data?.message || '获取我的游记失败',
        userDiariesLoading: false,
      });
    }
  },
  
  fetchPendingDiaries: async (params = { page: 1, limit: 10 }) => {
    set({ pendingDiariesLoading: true, pendingDiariesError: null });
    try {
      const response = await adminAPI.getPendingDiaries(params);
      set({ 
        pendingDiaries: response.items,
        pendingDiariesPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        pendingDiariesLoading: false,
      });
    } catch (error: any) {
      set({ 
        pendingDiariesError: error.response?.data?.message || '获取待审核游记失败',
        pendingDiariesLoading: false,
      });
    }
  },
  
  fetchRejectedDiaries: async (params = { page: 1, limit: 10 }) => {
    set({ rejectedDiariesLoading: true, rejectedDiariesError: null });
    try {
      const response = await adminAPI.getRejectedDiaries(params);
      set({ 
        rejectedDiaries: response.items,
        rejectedDiariesPagination: {
          total: response.total,
          page: response.page,
          limit: response.limit,
          totalPages: response.totalPages,
        },
        rejectedDiariesLoading: false,
      });
    } catch (error: any) {
      set({ 
        rejectedDiariesError: error.response?.data?.message || '获取已拒绝游记失败',
        rejectedDiariesLoading: false,
      });
    }
  },
  
  fetchDiaryById: async (id: string) => {
    set({ currentDiaryLoading: true, currentDiaryError: null });
    try {
      const diary = await diaryAPI.getDiaryById(id);
      set({ currentDiary: diary, currentDiaryLoading: false });
      return diary;
    } catch (error: any) {
      set({ 
        currentDiaryError: error.response?.data?.message || '获取游记详情失败',
        currentDiaryLoading: false,
      });
      throw error;
    }
  },
  
  createDiary: async (data: CreateDiaryData) => {
    set({ operationLoading: true, operationError: null });
    try {
      const diary = await diaryAPI.createDiary(data);
      // 更新用户游记列表
      const userDiaries = [diary, ...get().userDiaries];
      set({ 
        userDiaries,
        operationLoading: false,
      });
      return diary;
    } catch (error: any) {
      set({ 
        operationError: error.response?.data?.message || '创建游记失败',
        operationLoading: false,
      });
      throw error;
    }
  },
  
  updateDiary: async (id: string, data: UpdateDiaryData) => {
    set({ operationLoading: true, operationError: null });
    try {
      const updatedDiary = await diaryAPI.updateDiary(id, data);
      
      // 更新当前游记
      if (get().currentDiary?.id === id) {
        set({ currentDiary: updatedDiary });
      }
      
      // 更新用户游记列表
      const userDiaries = get().userDiaries.map(diary => 
        diary.id === id ? updatedDiary : diary
      );
      
      set({ 
        userDiaries,
        operationLoading: false,
      });
      
      return updatedDiary;
    } catch (error: any) {
      set({ 
        operationError: error.response?.data?.message || '更新游记失败',
        operationLoading: false,
      });
      throw error;
    }
  },
  
  deleteDiary: async (id: string) => {
    set({ operationLoading: true, operationError: null });
    try {
      await diaryAPI.deleteDiary(id);
      
      // 更新用户游记列表
      const userDiaries = get().userDiaries.filter(diary => diary.id !== id);
      
      // 清除当前游记（如果是被删除的）
      if (get().currentDiary?.id === id) {
        set({ currentDiary: null });
      }
      
      set({ 
        userDiaries,
        operationLoading: false,
      });
    } catch (error: any) {
      set({ 
        operationError: error.response?.data?.message || '删除游记失败',
        operationLoading: false,
      });
      throw error;
    }
  },
  
  approveDiary: async (id: string) => {
    set({ operationLoading: true, operationError: null });
    try {
      const approvedDiary = await adminAPI.approveDiary(id);
      
      // 更新待审核列表
      const pendingDiaries = get().pendingDiaries.filter(diary => diary.id !== id);
      
      // 更新公开列表
      const publicDiaries = [approvedDiary, ...get().publicDiaries];
      
      set({ 
        pendingDiaries,
        publicDiaries,
        operationLoading: false,
      });
      
      return approvedDiary;
    } catch (error: any) {
      set({ 
        operationError: error.response?.data?.message || '审核通过失败',
        operationLoading: false,
      });
      throw error;
    }
  },
  
  rejectDiary: async (id: string, data: RejectDiaryData) => {
    set({ operationLoading: true, operationError: null });
    try {
      const rejectedDiary = await adminAPI.rejectDiary(id, data);
      
      // 更新待审核列表
      const pendingDiaries = get().pendingDiaries.filter(diary => diary.id !== id);
      
      set({ 
        pendingDiaries,
        operationLoading: false,
      });
      
      return rejectedDiary;
    } catch (error: any) {
      set({ 
        operationError: error.response?.data?.message || '拒绝游记失败',
        operationLoading: false,
      });
      throw error;
    }
  },
  
  adminDeleteDiary: async (id: string) => {
    set({ operationLoading: true, operationError: null });
    try {
      await adminAPI.deleteDiary(id);
      
      // 更新所有列表
      const pendingDiaries = get().pendingDiaries.filter(diary => diary.id !== id);
      const publicDiaries = get().publicDiaries.filter(diary => diary.id !== id);
      
      // 清除当前游记（如果是被删除的）
      if (get().currentDiary?.id === id) {
        set({ currentDiary: null });
      }
      
      set({ 
        pendingDiaries,
        publicDiaries,
        operationLoading: false,
      });
    } catch (error: any) {
      set({ 
        operationError: error.response?.data?.message || '管理员删除游记失败',
        operationLoading: false,
      });
      throw error;
    }
  },
})); 