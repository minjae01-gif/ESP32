import React, { useEffect, useState } from 'react';
import { Card, Avatar, Typography, Descriptions, Spin, message, Divider, Tag } from 'antd';
import { UserOutlined, MailOutlined, ClockCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import Layout from '../components/Layout';

const { Title, Text } = Typography;

function MyPage() {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyInfo();
  }, []);

  const fetchMyInfo = async () => {
    try {
      // 백엔드에서 DB 정보 가져오기
      const response = await authAPI.getProfile();
      if (response.data.success) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      console.error('내 정보 조회 실패:', error);
      message.error('정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '100px' }}>
          <Spin size="large" tip="정보를 불러오는 중..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        <Card style={styles.card}>
          <div style={styles.header}>
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              style={{ backgroundColor: '#52c41a', marginBottom: '20px' }} 
            />
            <Title level={2} style={{ marginBottom: '5px' }}>
              {userInfo?.username}
            </Title>
            <Tag color="blue" icon={<SafetyCertificateOutlined />}>
              인증된 사용자
            </Tag>
          </div>

          <Divider />

          <Descriptions title="내 정보 상세" bordered column={1} labelStyle={{ width: '150px' }}>
            <Descriptions.Item label={<span><UserOutlined /> 사용자명</span>}>
              {userInfo?.username}
            </Descriptions.Item>
            
            <Descriptions.Item label={<span><MailOutlined /> 이메일</span>}>
              {userInfo?.email}
            </Descriptions.Item>
            
            <Descriptions.Item label={<span><ClockCircleOutlined /> 가입일</span>}>
              {userInfo?.created_at ? new Date(userInfo.created_at).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric'
              }) : '-'}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '40px 20px',
  },
  card: {
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px 0',
  },
};

export default MyPage;