import React from 'react';
import { Layout, Menu, Avatar } from 'antd';
import {
  HomeOutlined,
  DashboardOutlined,
  MessageOutlined,
  ShoppingOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Sider } = Layout;

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 현재 선택된 메뉴 키
  const selectedKey = location.pathname;

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: '홈',
      onClick: () => navigate('/'),
    },
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '대시보드',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: '/community',
      icon: <MessageOutlined />,
      label: '커뮤니티',
      onClick: () => navigate('/community'),
    },
    {
      key: '/marketplace',
      icon: <ShoppingOutlined />,
      label: '식물 거래',
      onClick: () => navigate('/marketplace'),
    },
    {
      key: '/mypage',
      icon: <UserOutlined />,
      label: '마이페이지',
      onClick: () => navigate('/mypage'),
    },
  ];

  return (
    <Sider
      width={240}
      style={{
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        background: '#001529',
        boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
      }}
    >
      {/* 로고 영역 */}
      <div style={styles.logo}>
        <span style={styles.logoIcon}>🌿</span>
        <span style={styles.logoText}>Plant Community</span>
      </div>

      {/* 사용자 정보 */}
      <div style={styles.userInfo}
      onClick={() => navigate('/mypage')}
      >
        {/* 기존: <div style={styles.userAvatar}>...</div> 
           변경: Ant Design Avatar 컴포넌트 사용 
        */}
        <Avatar 
          size={64} 
          icon={<UserOutlined />} 
          style={{ 
            backgroundColor: '#52c41a', 
            marginBottom: '12px',
            cursor: 'pointer' 
          }} 
        />
        <div style={styles.userName}>{user?.username || 'Guest'}</div>
      </div>

      {/* 메뉴 */}
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        style={{
          background: 'transparent',
          border: 'none',
          marginTop: '20px',
        }}
        theme="dark"
      />

      {/* 로그아웃 버튼 */}
      <div style={styles.logoutContainer}>
        <Menu
          mode="inline"
          theme="dark"
          style={{ background: 'transparent', border: 'none' }}
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: '로그아웃',
              onClick: handleLogout,
              danger: true,
            },
          ]}
        />
      </div>
    </Sider>
  );
}

const styles = {
  logo: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(255, 255, 255, 0.05)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  logoIcon: {
    fontSize: '28px',
    marginRight: '10px',
  },
  logoText: {
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  userInfo: {
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
  },
  //사용하지 않지만 혹시몰라서 남겨둠
  userAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    background: '#52c41a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: '12px',
  },
  userName: {
    color: '#fff',
    fontSize: '16px',
    fontWeight: '500',
  },
  logoutContainer: {
    position: 'absolute',
    bottom: '20px',
    left: 0,
    right: 0,
  },
};

export default Sidebar;