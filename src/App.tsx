import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';
import './App.css';

function App() {
  const { checkAuth, isLoggedIn, userInfo } = useAuthStore();
  
  useEffect(() => {
    console.log("App组件挂载, 检查认证状态");
    checkAuth();
  }, [checkAuth]);
  
  // 打印当前登录状态和用户信息
  useEffect(() => {
    console.log("App组件更新 - 登录状态:", isLoggedIn);
    console.log("App组件更新 - 用户信息:", userInfo);
  }, [isLoggedIn, userInfo]);
  
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={
              isLoggedIn && (userInfo?.role === 'admin' || userInfo?.role === 'reviewer') ? (
                <Navigate to="/" replace />
              ) : (
                <Login />
              )
            } 
          />
          <Route 
            path="/" 
            element={
              !isLoggedIn || (userInfo?.role !== 'admin' && userInfo?.role !== 'reviewer') ? (
                <Navigate to="/login" replace />
              ) : (
                <AdminLayout />
              )
            }
          />
          <Route 
            path="/approved" 
            element={
              !isLoggedIn || (userInfo?.role !== 'admin' && userInfo?.role !== 'reviewer') ? (
                <Navigate to="/login" replace />
              ) : (
                <AdminLayout />
              )
            }
          />
          <Route 
            path="/rejected" 
            element={
              !isLoggedIn || (userInfo?.role !== 'admin' && userInfo?.role !== 'reviewer') ? (
                <Navigate to="/login" replace />
              ) : (
                <AdminLayout />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
