import { useLocation } from 'react-router-dom';
import React from 'react';
import { Layout as AntLayout } from 'antd';
import Sidebar from './Sidebar';

const { Content } = AntLayout;

// ❌ 여기 함수 밖(Top level)에 있던 const location... 부분은 삭제했어!

function Layout({ children }) {
  // ✅ 훅은 반드시 이렇게 함수 안에서만 불러야 해!
  const location = useLocation();
  
  // 사이드바를 숨기고 싶은 경로들
  const excludePaths = ['/login', '/register', '/signup'];
  const isExcluded = excludePaths.includes(location.pathname);

  // 로그인 페이지 등에서는 사이드바 없이 내용만 보여줌
  if (isExcluded) {
    return (
      <div style={{ background: '#f0f2f5', minHeight: '100vh' }}>
        {children}
      </div>
    );
  }

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <AntLayout style={{ marginLeft: 240 }}>
        <Content style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
}

export default Layout;