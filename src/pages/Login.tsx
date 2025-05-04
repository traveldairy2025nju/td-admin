import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, Card } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const { Title } = Typography;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoggedIn, userInfo, error } = useAuthStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 如果已登录，重定向到首页
    if (isLoggedIn && userInfo?.role === 'admin') {
      navigate('/');
    }
  }, [isLoggedIn, userInfo, navigate]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      setLoading(true);
      await login(values);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      console.error('登录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-form">
        <Title level={2} className="login-title">旅游日记审核平台</Title>
        <Form
          name="login_form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="用户名" 
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Typography.Text type="secondary">
              测试账号: testuser / test123456
            </Typography.Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
