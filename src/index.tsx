import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/lib/locale/zh_CN';
import App from './App';
import { useAuthStore } from './store/authStore';
import './index.css';
import reportWebVitals from './reportWebVitals';

const root = document.getElementById('root') as HTMLElement;

// 应用初始化组件
const AppInitializer: React.FC = () => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    // 应用启动时检查用户登录状态
    checkAuth();
  }, [checkAuth]);

  return (
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  );
};

// 渲染应用
ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <AppInitializer />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
