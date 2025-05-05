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

// 修正：直接指向后端服务，baseURL已包含'/api'
const baseURL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL,
  timeout: 30000,
  // 移除withCredentials设置，因为后端CORS配置使用了通配符*
});

// 请求拦截器添加令牌
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API请求:', config.method?.toUpperCase(), config.url);
    console.log('完整请求URL:', `${config.baseURL || ''}${config.url || ''}`);
    console.log('令牌存在:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('API请求错误:', error);
    return Promise.reject(error);
  }
);

// 添加响应拦截器
api.interceptors.response.use(
  (response) => {
    console.log('API响应成功:', response.config.url, response.status);
    return response;
  },
  (error) => {
    console.error('API响应错误:', error.config?.url, error.response?.status, error.message);
    return Promise.reject(error);
  }
);

// 处理API标准响应格式
const handleResponse = (response: any) => {
  console.log('处理API响应:', response.config?.url);
  
  // 检查响应是否包含标准格式 {success, data}
  if (response.data && response.data.hasOwnProperty('success')) {
    console.log('响应包含标准格式 {success, data}');
    
    if (response.data.success) {
      console.log('响应成功, 返回data部分');
      return response.data.data;
    } else {
      console.error('响应失败:', response.data.message);
      throw new Error(response.data.message || '请求失败');
    }
  }
  
  // 如果没有标准格式，直接返回数据
  console.log('响应不包含标准格式，直接返回数据');
  return response.data;
};

// 认证相关API
export const authAPI = {
  login: (data: LoginData): Promise<LoginResponse> => {
    console.log('调用登录API, 用户名:', data.username);
    // 修正：路径从'/auth/login'改为'/users/login'
    return api.post('/users/login', data).then(res => {
      const userData = handleResponse(res);
      console.log('登录API响应数据:', { token: '***', user: userData });
      
      // 将MongoDB的_id映射为id，保持与现有代码兼容
      return {
        token: userData.token,
        user: {
          id: userData._id,
          username: userData.username,
          nickname: userData.nickname,
          avatarUrl: userData.avatar,
          role: userData.role,
          createdAt: userData.createdAt || new Date().toISOString()
        }
      };
    });
  },
    
  register: (formData: FormData): Promise<LoginResponse> => 
    api.post('/users/register', formData).then(res => {
      const userData = handleResponse(res);
      return {
        token: userData.token,
        user: {
          id: userData._id,
          username: userData.username,
          nickname: userData.nickname,
          avatarUrl: userData.avatar,
          role: userData.role,
          createdAt: userData.createdAt || new Date().toISOString()
        }
      };
    }),
    
  getUserProfile: (): Promise<User> => {
    console.log('获取用户资料');
    return api.get('/users/profile').then(res => {
      const userData = handleResponse(res);
      console.log('获取用户资料成功:', userData);
      
      return {
        id: userData._id,
        username: userData.username,
        nickname: userData.nickname,
        avatarUrl: userData.avatar,
        role: userData.role,
        createdAt: userData.createdAt || new Date().toISOString()
      };
    });
  },
    
  updateAvatar: (avatarUrl: string) => 
    api.put('/users/avatar', { avatarUrl }).then(res => handleResponse(res)),
    
  updateNickname: (nickname: string) => 
    api.put('/users/nickname', { nickname }).then(res => handleResponse(res)),
};

// 处理游记数据格式（将MongoDB的_id转换为id）
const mapDiaryData = (diary: any): Diary => {
  try {
    console.log('映射游记数据:', diary);
    
    // 检查必要字段是否存在
    if (!diary || !diary._id) {
      console.error('游记数据缺少关键字段:', diary);
      // 返回一个默认值而不是抛出异常
      return {
        id: 'unknown',
        title: '数据错误',
        content: '该游记数据不完整',
        images: [],
        videoUrl: undefined,
        status: 'approved',
        rejectReason: undefined,
        author: {
          id: 'unknown',
          username: '未知用户',
          nickname: '未知用户',
          avatarUrl: ''
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }
    
    // 检查author字段
    let authorData = {
      id: 'unknown',
      username: '未知用户',
      nickname: '未知用户',
      avatarUrl: ''
    };
    
    if (diary.author && typeof diary.author === 'object') {
      authorData = {
        id: diary.author._id || 'unknown',
        username: diary.author.username || '未知用户',
        nickname: diary.author.nickname || '未知用户',
        avatarUrl: diary.author.avatar || ''
      };
    }
    
    // 映射数据并返回
    const mappedDiary = {
      id: diary._id,
      title: diary.title || '无标题',
      content: diary.content || '',
      images: Array.isArray(diary.images) ? diary.images : [],
      videoUrl: diary.video || undefined,
      status: diary.status || 'approved',
      rejectReason: diary.rejectReason || undefined,
      author: authorData,
      createdAt: diary.createdAt || new Date().toISOString(),
      updatedAt: diary.updatedAt || new Date().toISOString()
    };
    
    console.log('映射后的游记数据:', mappedDiary);
    return mappedDiary;
  } catch (error) {
    console.error('游记数据映射失败:', error, diary);
    // 返回一个默认值
    return {
      id: 'error',
      title: '数据错误',
      content: '处理游记数据时出现错误',
      images: [],
      videoUrl: undefined,
      status: 'approved',
      rejectReason: undefined,
      author: {
        id: 'unknown',
        username: '未知用户',
        nickname: '未知用户',
        avatarUrl: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
};

// 游记相关API
export const diaryAPI = {
  createDiary: (data: CreateDiaryData): Promise<Diary> => 
    api.post('/diaries', data).then(res => {
      const diaryData = handleResponse(res);
      return mapDiaryData(diaryData);
    }),
    
  updateDiary: (id: string, data: UpdateDiaryData): Promise<Diary> => 
    api.put(`/diaries/${id}`, data).then(res => {
      const diaryData = handleResponse(res);
      return mapDiaryData(diaryData);
    }),
    
  deleteDiary: (id: string) => 
    api.delete(`/diaries/${id}`).then(res => handleResponse(res)),
    
  getDiaryById: (id: string): Promise<Diary> => 
    api.get(`/diaries/${id}`).then(res => {
      const diaryData = handleResponse(res);
      return mapDiaryData(diaryData);
    }),
    
  getPublicDiaries: (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Diary>> => {
    console.log('调用getPublicDiaries API, 参数:', params);
    return api.get('/diaries', { params })
      .then(res => {
        console.log('获取已审核游记响应原始数据:', JSON.stringify(res.data));
        const paginatedData = handleResponse(res);
        console.log('处理后的分页数据:', paginatedData);
        
        if (!paginatedData.items || !Array.isArray(paginatedData.items)) {
          console.error('获取到的items不是数组或为空:', paginatedData);
          return {
            items: [],
            total: 0,
            page: params?.page || 1,
            limit: params?.limit || 10,
            totalPages: 0
          };
        }
        
        return {
          items: paginatedData.items.map(mapDiaryData),
          total: paginatedData.total,
          page: paginatedData.page,
          limit: paginatedData.limit,
          totalPages: paginatedData.totalPages
        };
      })
      .catch(error => {
        console.error('获取已审核游记失败:', error);
        console.error('错误详情:', error.response?.data || error.message);
        throw error;
      });
  },
    
  getUserDiaries: (params?: { page?: number; limit?: number; status?: 'pending' | 'approved' | 'rejected' }): Promise<PaginatedResponse<Diary>> => 
    api.get('/diaries/user/me', { params }).then(res => {
      const paginatedData = handleResponse(res);
      return {
        items: paginatedData.items.map(mapDiaryData),
        total: paginatedData.total,
        page: paginatedData.page,
        limit: paginatedData.limit,
        totalPages: paginatedData.totalPages
      };
    }),
};

// 管理员相关API
export const adminAPI = {
  getPendingDiaries: (params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Diary>> => 
    api.get('/admin/diaries/pending', { params }).then(res => {
      const paginatedData = handleResponse(res);
      return {
        items: paginatedData.items.map(mapDiaryData),
        total: paginatedData.total,
        page: paginatedData.page,
        limit: paginatedData.limit,
        totalPages: paginatedData.totalPages
      };
    }),
    
  getApprovedDiaries: (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Diary>> => 
    api.get('/admin/diaries/approved', { params }).then(res => {
      const paginatedData = handleResponse(res);
      return {
        items: paginatedData.items.map(mapDiaryData),
        total: paginatedData.total,
        page: paginatedData.page,
        limit: paginatedData.limit,
        totalPages: paginatedData.totalPages
      };
    }),
    
  getRejectedDiaries: (params?: { page?: number; limit?: number; keyword?: string }): Promise<PaginatedResponse<Diary>> => 
    api.get('/diaries/rejected', { params }).then(res => {
      const paginatedData = handleResponse(res);
      return {
        items: paginatedData.items.map(mapDiaryData),
        total: paginatedData.total,
        page: paginatedData.page,
        limit: paginatedData.limit,
        totalPages: paginatedData.totalPages
      };
    }),
    
  approveDiary: (id: string): Promise<Diary> => 
    api.put(`/admin/diaries/${id}/approve`).then(res => {
      const diaryData = handleResponse(res);
      return mapDiaryData(diaryData);
    }),
    
  rejectDiary: (id: string, data: RejectDiaryData): Promise<Diary> => 
    api.put(`/admin/diaries/${id}/reject`, data).then(res => {
      const diaryData = handleResponse(res);
      return mapDiaryData(diaryData);
    }),
    
  deleteDiary: (id: string) => 
    api.delete(`/admin/diaries/${id}`).then(res => handleResponse(res)),
};

// 文件上传API
export const uploadAPI = {
  uploadFile: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData).then(res => handleResponse(res));
  },
};

export default api; 