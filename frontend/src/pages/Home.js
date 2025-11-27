import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Button, List, Tag, Space, Avatar } from 'antd';
import {
  RightOutlined,
  MessageOutlined,
  ShoppingOutlined,
  DashboardOutlined,
  UserOutlined,
  FireOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { postAPI, marketplaceAPI, sensorAPI } from '../services/api';
import Layout from '../components/Layout';

const { Title, Text, Paragraph } = Typography;

function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [recentPosts, setRecentPosts] = useState([]);
  const [recentItems, setRecentItems] = useState([]);
  const [sensorData, setSensorData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 최신 게시글 (5개)
      const postsRes = await postAPI.getPosts();
      setRecentPosts(postsRes.data.posts?.slice(0, 5) || []);

      // 최신 거래글 (5개)
      const itemsRes = await marketplaceAPI.getItems();
      setRecentItems(itemsRes.data.items?.slice(0, 5) || []);

      // 센서 데이터
      const sensorRes = await sensorAPI.getLatestData();
      setSensorData(sensorRes.data.data);
    } catch (error) {
      console.error('데이터 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;
    if (diffHours < 24) return `${diffHours}시간 전`;
    if (diffDays < 7) return `${diffDays}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getSoilStatus = (value) => {
    if (value >= 60) return { text: '습함', color: '#52c41a' };
    if (value >= 30) return { text: '적당함', color: '#faad14' };
    return { text: '건조함', color: '#ff4d4f' };
  };

  const getLightStatus = (value) => {
    if (value >= 7) return { text: '밝음', color: '#52c41a' };
    if (value >= 3) return { text: '적당함', color: '#faad14' };
    return { text: '어두움', color: '#8c8c8c' };
  };

  return (
    <Layout>
      <div style={styles.container}>
        {/* 헤더 */}
        <div style={styles.header}>
          <Title level={2}>🌿 Plant Community</Title>
          <Text type="secondary">식물을 사랑하는 사람들의 커뮤니티</Text>
        </div>

        <Row gutter={[24, 24]} style={{ marginTop: '32px' }}>
          {/* 왼쪽 컬럼 */}
          <Col xs={24} lg={16}>
            {/* 최신 커뮤니티 글 */}
            <Card
              title={
                <Space>
                  <MessageOutlined style={{ color: '#52c41a' }} />
                  <Text strong>최신 커뮤니티 글</Text>
                </Space>
              }
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate('/community')}
                  icon={<RightOutlined />}
                >
                  더보기
                </Button>
              }
              style={styles.card}
              loading={loading}
            >
              <List
                dataSource={recentPosts}
                locale={{ emptyText: '아직 게시글이 없습니다.' }}
                renderItem={(post) => (
                  <List.Item
                    style={styles.listItem}
                    onClick={() => navigate(`/community/${post.id}`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<UserOutlined />} 
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      }
                      title={
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text strong style={styles.listTitle}>
                            {post.title}
                          </Text>
                          <Tag icon={<ClockCircleOutlined />} color="default">
                            {formatDate(post.created_at)}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">{post.username}</Text>
                          <Text type="secondary">•</Text>
                          <Text type="secondary">
                            {post.content?.substring(0, 50)}...
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>

            {/* 최신 거래글 */}
            <Card
              title={
                <Space>
                  <ShoppingOutlined style={{ color: '#1890ff' }} />
                  <Text strong>최신 거래글</Text>
                </Space>
              }
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate('/marketplace')}
                  icon={<RightOutlined />}
                >
                  더보기
                </Button>
              }
              style={{ ...styles.card, marginTop: '24px' }}
              loading={loading}
            >
              <List
                dataSource={recentItems}
                locale={{ emptyText: '아직 거래글이 없습니다.' }}
                renderItem={(item) => (
                  <List.Item
                    style={styles.listItem}
                    onClick={() => navigate(`/marketplace/${item.id}`)}
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar 
                          icon={<ShoppingOutlined />} 
                          style={{ backgroundColor: '#1890ff' }}
                        />
                      }
                      title={
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Text strong style={styles.listTitle}>
                            {item.title}
                          </Text>
                          <Space>
                            <Tag color="green" style={{ fontSize: '14px', fontWeight: 'bold' }}>
                              {item.price?.toLocaleString()}원
                            </Tag>
                            <Tag icon={<ClockCircleOutlined />} color="default">
                              {formatDate(item.created_at)}
                            </Tag>
                          </Space>
                        </Space>
                      }
                      description={
                        <Space>
                          <Text type="secondary">{item.username}</Text>
                          <Text type="secondary">•</Text>
                          <Tag color={item.status === 'selling' ? 'blue' : 'default'}>
                            {item.status === 'selling' ? '판매중' : '판매완료'}
                          </Tag>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* 오른쪽 컬럼 */}
          <Col xs={24} lg={8}>
            {/* 센서 현황 요약 */}
            <Card
              title={
                <Space>
                  <DashboardOutlined style={{ color: '#faad14' }} />
                  <Text strong>센서 현황</Text>
                </Space>
              }
              extra={
                <Button 
                  type="link" 
                  onClick={() => navigate('/dashboard')}
                  icon={<RightOutlined />}
                >
                  상세보기
                </Button>
              }
              style={styles.card}
              loading={loading}
            >
              {sensorData ? (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={styles.sensorItem}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>🌡️ 온도</Text>
                      <Text strong style={{ fontSize: '18px', color: '#ff4d4f' }}>
                        {sensorData.temperature}°C
                      </Text>
                    </Space>
                  </div>
                  
                  <div style={styles.sensorItem}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>💧 습도</Text>
                      <Text strong style={{ fontSize: '18px', color: '#1890ff' }}>
                        {sensorData.humidity}%
                      </Text>
                    </Space>
                  </div>
                  
                  <div style={styles.sensorItem}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>🌱 토양습도</Text>
                      <Tag color={getSoilStatus(sensorData.soilMoisture).color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {sensorData.soilMoisture}% ({getSoilStatus(sensorData.soilMoisture).text})
                      </Tag>
                    </Space>
                  </div>
                  
                  <div style={styles.sensorItem}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Text>💡 조도</Text>
                      <Tag color={getLightStatus(sensorData.lightLevel).color} style={{ fontSize: '14px', padding: '4px 12px' }}>
                        {sensorData.lightLevel}/10 ({getLightStatus(sensorData.lightLevel).text})
                      </Tag>
                    </Space>
                  </div>

                  {(sensorData.soilMoisture < 30 || sensorData.lightLevel < 3) && (
                    <Card size="small" style={{ background: '#fff7e6', border: '1px solid #ffd591' }}>
                      <Space direction="vertical" size="small">
                        <Text strong style={{ color: '#d46b08' }}>⚠️ 주의 필요</Text>
                        {sensorData.soilMoisture < 30 && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            • 토양이 건조합니다
                          </Text>
                        )}
                        {sensorData.lightLevel < 3 && (
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            • 조도가 낮습니다
                          </Text>
                        )}
                      </Space>
                    </Card>
                  )}
                </Space>
              ) : (
                <Text type="secondary">센서 데이터를 불러올 수 없습니다.</Text>
              )}
            </Card>

            {/* 마이페이지 요약 */}
            <Card
              title={
                <Space>
                  <UserOutlined style={{ color: '#722ed1' }} />
                  <Text strong>내 정보</Text>
                </Space>
              }
              style={{ ...styles.card, marginTop: '24px' }}
            >
              {user ? (
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={styles.profileSection}>
                    <Avatar 
                      size={64} 
                      style={{ backgroundColor: '#52c41a', fontSize: '28px' }}
                    >
                      {user.username?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div style={{ marginTop: '12px' }}>
                      <Text strong style={{ fontSize: '18px', display: 'block' }}>
                        {user.username}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '14px' }}>
                        {user.email}
                      </Text>
                    </div>
                  </div>

                  <div style={styles.statsSection}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Button 
                        block 
                        onClick={() => navigate('/community')}
                        style={styles.actionButton}
                      >
                        <MessageOutlined /> 내 게시글 보기
                      </Button>
                      <Button 
                        block 
                        onClick={() => navigate('/marketplace')}
                        style={styles.actionButton}
                      >
                        <ShoppingOutlined /> 내 거래글 보기
                      </Button>
                    </Space>
                  </div>
                </Space>
              ) : (
                <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }} size="middle">
                  <Avatar size={64} icon={<UserOutlined />} style={{ backgroundColor: '#d9d9d9' }} />
                  <Text type="secondary">로그인하여 더 많은 기능을 이용하세요</Text>
                  <Button 
                    type="primary" 
                    onClick={() => navigate('/login')}
                    style={{ background: '#52c41a', borderColor: '#52c41a' }}
                  >
                    로그인하기
                  </Button>
                </Space>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    padding: '24px',
  },
  header: {
    marginBottom: '8px',
  },
  card: {
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  listItem: {
    cursor: 'pointer',
    padding: '12px 16px',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#f5f5f5',
    },
  },
  listTitle: {
    fontSize: '15px',
    maxWidth: '400px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  sensorItem: {
    padding: '12px',
    background: '#fafafa',
    borderRadius: '8px',
  },
  profileSection: {
    textAlign: 'center',
    padding: '16px 0',
  },
  statsSection: {
    marginTop: '16px',
  },
  actionButton: {
    height: '40px',
    fontSize: '14px',
  },
};

export default Home;