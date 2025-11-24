import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';

const { Title, Text } = Typography;

function Register() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.register(values);
      message.success('회원가입이 완료되었습니다!');
      navigate('/login');
    } catch (error) {
      message.error('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          🌱 회원가입
        </Title>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '사용자명을 입력하세요!' },
              { min: 3, message: '최소 3자 이상 입력하세요!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="사용자명"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력하세요!' },
              { type: 'email', message: '올바른 이메일을 입력하세요!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="이메일"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력하세요!' },
              { min: 6, message: '최소 6자 이상 입력하세요!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '비밀번호를 다시 입력하세요!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호 확인"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                회원가입
              </Button>
              <Button
                size="large"
                block
                onClick={() => navigate('/dashboard')}
                style={{ borderColor: '#d9d9d9' }}
              >
                🏠 게스트로 둘러보기
              </Button>
            </Space>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>이미 계정이 있으신가요? </Text>
            <Link to="/login">로그인</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '450px',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  },
};

export default Register;