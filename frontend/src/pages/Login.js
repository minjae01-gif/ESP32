import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message, Space , Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();


  const [searchParams] = useSearchParams();
  const isAuthRequired = searchParams.get('auth') === 'required';

  const onFinish = async (values) => {
  setLoading(true);
  try {
    // AuthContext의 login 함수 호출
    const result = await login(values.email, values.password);
    if (result.success) {
      message.success('로그인 성공!');
      navigate('/dashboard');
    } else {
      message.error(result.message || '로그인에 실패했습니다.');
    }
  } catch (error) {
    console.error(error);
    message.error('로그인 중 알 수 없는 오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.container}>
      <Card style={styles.card}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: '30px' }}>
          🌱 로그인
        </Title>

                {/* 🔥 핵심: 주소 뒤에 auth=required가 있으면 고정된 경고 박스를 보여줌 */}
        {isAuthRequired && (
          <Alert
            message="로그인이 필요한 서비스입니다."
            description="계속하려면 먼저 로그인해주세요."
            type="warning"
            showIcon
            style={{ marginBottom: '24px' }}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '이메일을 입력하세요!' },
              { type: 'email', message: '올바른 이메일을 입력하세요!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="이메일"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '비밀번호를 입력하세요!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="비밀번호"
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
                로그인
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
            <Text>아직 계정이 없으신가요? </Text>
            <Link to="/register">회원가입</Link>
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

export default Login;