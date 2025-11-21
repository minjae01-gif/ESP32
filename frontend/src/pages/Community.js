import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, Badge, Input } from 'antd';
import {
  EditOutlined,
  CommentOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

const { Title } = Typography;
const { Search } = Input;

function Community() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getPosts();
      setPosts(response.data.posts);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes}분 전`;
      }
      return `${diffHours}시간 전`;
    } else if (diffDays === 1) {
      return '어제';
    } else if (diffDays < 7) {
      return `${diffDays}일 전`;
    } else {
      return date.toLocaleDateString('ko-KR');
    }
  };

  // 검색 필터링
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchText.toLowerCase()) ||
    post.username.toLowerCase().includes(searchText.toLowerCase())
  );

  // 테이블 컬럼 정의
  const columns = [
    {
      title: '번호',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      align: 'center',
      render: (id) => <Badge count={id} style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: '제목',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {record.image_url && (
              <Tag color="green" icon={<EditOutlined />}>
                이미지
              </Tag>
            )}
            <span
              onClick={() => navigate(`/community/${record.id}`)}
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#262626',
                cursor: 'pointer',
              }}
            >
              {text}
            </span>
          </div>
        );
      },
    },
    {
      title: '작성자',
      dataIndex: 'username',
      key: 'username',
      width: 150,
      align: 'center',
      render: (username, record) => (
        <Space>
          <UserOutlined style={{ color: '#52c41a' }} />
          <span style={{ fontWeight: '500' }}>{username}</span>
          {record.user_id === user?.userId && (
            <Tag color="green">내글</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '작성일',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      align: 'center',
      render: (date) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <span style={{ color: '#595959' }}>{formatDate(date)}</span>
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <div style={styles.container}>
        {/* 헤더 */}
        <div style={styles.header}>
          <Title level={2} style={{ margin: 0 }}>
            💬 커뮤니티
          </Title>
          <Space>
            <Search
              placeholder="제목, 작성자 검색..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
            />
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/community/write')}
              style={{ background: '#52c41a', borderColor: '#52c41a' }}
            >
              글쓰기
            </Button>
          </Space>
        </div>

        {/* 통계 정보 */}
        <div style={styles.stats}>
          <Space size="large">
            <span>
              전체 게시글: <strong style={{ color: '#52c41a', fontSize: '16px' }}>
                {filteredPosts.length}
              </strong>개
            </span>
            {searchText && (
              <span>
                검색 결과: <strong style={{ color: '#1890ff', fontSize: '16px' }}>
                  {filteredPosts.length}
                </strong>개
              </span>
            )}
          </Space>
        </div>

        {/* 게시글 테이블 */}
        <Table
          columns={columns}
          dataSource={filteredPosts}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: false,
            showTotal: (total) => `총 ${total}개`,
          }}
          style={styles.table}
          rowClassName={() => 'hoverable-row'}
          onRow={(record) => ({
            onClick: () => navigate(`/community/${record.id}`),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: searchText ? '검색 결과가 없습니다.' : '게시글이 없습니다.',
          }}
        />
      </div>
    </Layout>
  );
}

const styles = {
  container: {
    padding: '24px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  stats: {
    padding: '16px',
    background: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  table: {
    background: '#fff',
  },
};

export default Community;