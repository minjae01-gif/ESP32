import React, { useEffect, useState } from 'react';
import { List, Avatar, Card, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { UserOutlined, MessageOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function ChatListPage() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await chatAPI.getRooms();
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (error) {
      console.error("채팅 목록 로드 실패", error);
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}><MessageOutlined /> 내 채팅 목록</Title>
      <Card>
        <List
          itemLayout="horizontal"
          dataSource={rooms}
          renderItem={(room) => (
            <List.Item 
              onClick={() => navigate(`/chat/${room.id}`)}
              style={{ cursor: 'pointer', padding: '15px' }}
              className="chat-item-hover" // CSS로 마우스 올렸을 때 색 변하게 하면 좋아!
            >
              <List.Item.Meta
                avatar={<Avatar size="large" icon={<UserOutlined />} />}
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>{room.opponent_name}님과의 대화</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                      {new Date(room.created_at).toLocaleDateString()}
                    </Text>
                  </div>
                }
                description={
                  <div>
                    <Tag color="green">{room.item_title}</Tag>
                    {/* 여기에 나중에 '마지막 메시지'를 넣으면 완벽해! */}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
}

export default ChatListPage;