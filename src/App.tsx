import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import AdminLayout from './layouts/AdminLayout';
import Login from './pages/Login';
import { useAuthStore } from './store/authStore';
import './App.css';

// 管理员路由守卫
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, userInfo } = useAuthStore();
  
  if (!isLoggedIn || userInfo?.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            {/* 嵌套路由将在AdminLayout中定义 */}
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
