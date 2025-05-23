import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Menu, 
  Typography, 
  Avatar, 
  Dropdown, 
  Button,
  Modal,
  message 
} from 'antd';
import {
  AuditOutlined,
  UserOutlined,
  LogoutOutlined,
  CheckOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SafetyOutlined,
  CloseOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import PendingDiaries from '../pages/PendingDiaries';
import ApprovedDiaries from '../pages/ApprovedDiaries';
import RejectedDiaries from '../pages/RejectedDiaries';
import MyReviews from '../pages/MyReviews';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [confirmLogoutVisible, setConfirmLogoutVisible] = useState(false);
  
  // 判断是否为管理员
  const isAdmin = userInfo?.role === 'admin';
  const roleText = isAdmin ? '管理员' : '审核员';
  
  const handleMenuClick = (key: string) => {
    console.log('菜单点击, 切换到:', key);
    navigate(key === 'pending' ? '/' : `/${key}`);
  };
  
  const handleLogout = () => {
    setConfirmLogoutVisible(true);
  };
  
  const confirmLogout = () => {
    logout();
    message.success('已退出登录');
    navigate('/login');
    setConfirmLogoutVisible(false);
  };
  
  const userMenu = (
    <Menu>
      <Menu.Item key="role" disabled>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SafetyOutlined style={{ marginRight: 8 }} />
          <span>{roleText}</span>
        </div>
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="dark"
        width={256}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
          zIndex: 10
        }}
      >
        <div className="logo">
          <AuditOutlined style={{ fontSize: 22, marginRight: collapsed ? 0 : 12 }} />
          {!collapsed && <span>旅游日记审核平台</span>}
        </div>
        
        <Menu 
          theme="dark" 
          mode="inline"
          selectedKeys={[
            location.pathname === '/approved' ? 'approved' : 
            location.pathname === '/rejected' ? 'rejected' :
            location.pathname === '/my-reviews' ? 'my-reviews' : 'pending'
          ]}
        >
          <Menu.Item key="pending" icon={<AuditOutlined />} onClick={() => handleMenuClick('pending')}>
            待审核游记
          </Menu.Item>
          <Menu.Item key="approved" icon={<CheckOutlined />} onClick={() => handleMenuClick('approved')}>
            已审核游记
          </Menu.Item>
          <Menu.Item key="rejected" icon={<CloseOutlined />} onClick={() => handleMenuClick('rejected')}>
            已拒绝游记
          </Menu.Item>
          <Menu.Item key="my-reviews" icon={<BarChartOutlined />} onClick={() => handleMenuClick('my-reviews')}>
            我的审核
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 256, transition: 'margin-left 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: '#fff',
          boxShadow: '0 1px 4px rgba(0, 21, 41, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 48, height: 48 }}
          />
          
          <div>
            <Dropdown overlay={userMenu} placement="bottomRight">
              <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  src={userInfo?.avatarUrl}
                  style={{ marginRight: 8 }}
                />
                <Text strong>{userInfo?.nickname || userInfo?.username}</Text>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, overflow: 'initial' }}>
          {location.pathname === '/approved' ? (
            <ApprovedDiaries isAdmin={isAdmin} />
          ) : location.pathname === '/rejected' ? (
            <RejectedDiaries isAdmin={isAdmin} />
          ) : location.pathname === '/my-reviews' ? (
            <MyReviews />
          ) : (
            <PendingDiaries isAdmin={isAdmin} />
          )}
          <Outlet />
        </Content>
      </Layout>
      
      <Modal
        title="确认退出"
        open={confirmLogoutVisible}
        onOk={confirmLogout}
        onCancel={() => setConfirmLogoutVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>确定要退出登录吗？</p>
      </Modal>
    </Layout>
  );
};

export default AdminLayout; 